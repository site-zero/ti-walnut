import { AlertError, jsonClone, Str, Vars } from "@site0/tijs";
import _ from "lodash";
import { computed, ComputedRef } from "vue";
import {
  GlobalStatusApi,
  RdsListStoreOptions,
  RefreshOptions,
  StdListStoreOptions,
  useRdsListStore,
  useSessionStore,
  useStdListStore,
} from "../..";
import {
  getUserRoleName,
  StoreListApi,
  UserRoleMapping,
} from "../wn-store-types";
import {
  any_to_user_role_mapping,
  append_current_user_role_mappings_as,
  clear_current_user_role_mappings,
  gen_user_role_mapping,
  get_current_user_role_grps,
  get_current_user_roles,
  to_user_role_grps,
} from "./auth-user-roles";

type StoreType = "std" | "rds";

export type AuthStoreOptions = {
  // 全局状态
  globalStatus?: GlobalStatusApi;

  /**
   * 界面 reload  的时候，可能会通过 url hash 指定一个对象 ID
   * 这里需要指明这个对象ID 是那种具体的数据.
   * 然后再 reload 的时候，才能自动高亮对应的数据行
   */
  mainObjType?: "user" | "role" | "mapping";

  // 用户
  userStoreType: StoreType;
  userRdsStoreOptions?: RdsListStoreOptions;
  userStdStoreOptions?: StdListStoreOptions;

  // 角色
  roleStoreType: StoreType;
  roleRdsStoreOptions?: RdsListStoreOptions;
  roleStdStoreOptions?: StdListStoreOptions;

  // 用户角色映射
  userRoleMappingStoreType: StoreType;
  userRoleMappingRdsStoreOptions?: RdsListStoreOptions;
  userRoleMappingStdStoreOptions?: StdListStoreOptions;
};

export type AuthStoreApi = ReturnType<typeof useAuthStore>;

export type _auth_inner_api = {
  _users: StoreListApi;
  _roles: StoreListApi;
  _user_role_mappings: StoreListApi;
  UserRoles: ComputedRef<Map<String, UserRoleMapping[]>>;
};

export function useAuthStore(options: AuthStoreOptions) {
  //---------------------------------------------
  let {
    globalStatus,
    mainObjType,
    userStoreType,
    userRdsStoreOptions,
    userStdStoreOptions,
    roleStoreType,
    roleRdsStoreOptions,
    roleStdStoreOptions,
    userRoleMappingStoreType,
    userRoleMappingRdsStoreOptions,
    userRoleMappingStdStoreOptions,
  } = options;
  //---------------------------------------------
  const session = useSessionStore();
  //---------------------------------------------
  // 准备数据访问模型
  //---------------------------------------------
  const _users: StoreListApi =
    "std" == userStoreType
      ? useStdListStore(userStdStoreOptions!)
      : useRdsListStore(userRdsStoreOptions!);
  const _roles: StoreListApi =
    "std" == roleStoreType
      ? useStdListStore(roleStdStoreOptions!)
      : useRdsListStore(roleRdsStoreOptions!);
  const _user_role_mappings: StoreListApi =
    "std" == userRoleMappingStoreType
      ? useStdListStore(userRoleMappingStdStoreOptions!)
      : useRdsListStore(userRoleMappingRdsStoreOptions!);
  //---------------------------------------------
  const _Main = computed(() => {
    if ("user" == mainObjType) {
      return _users;
    } else if ("role" == mainObjType) {
      return _roles;
    } else if ("mapping" == mainObjType) {
      return _user_role_mappings;
    }
  });
  //---------------------------------------------
  const UserRoles = computed(() => {
    const re: Map<string, UserRoleMapping[]> = new Map();
    let mappings = _user_role_mappings.listData.value;
    for (let mapping of mappings) {
      let it = any_to_user_role_mapping(mapping);
      let list = re.get(it.uid);
      if (!list) {
        re.set(it.uid, [it]);
      } else {
        list.push(it);
      }
    }
    return re;
  });
  //---------------------------------------------
  const _api: _auth_inner_api = {
    _users,
    _roles,
    _user_role_mappings,
    UserRoles,
  };
  //---------------------------------------------
  // 计算属性
  //---------------------------------------------

  const changed = computed(() => {
    return (
      _users.changed.value ||
      _roles.changed.value ||
      _user_role_mappings.changed.value
    );
  });
  //---------------------------------------------
  const ActionBarVars = computed(() => {
    return {
      ...(_Main.value?.ActionBarVars.value ?? {}),
      changed: changed.value,
      loading:
        _users.ActionStatus.value == "loading" ||
        _roles.ActionStatus.value == "loading" ||
        _user_role_mappings.ActionStatus.value == "loading",
      saving:
        _users.ActionStatus.value == "saving" ||
        _roles.ActionStatus.value == "saving" ||
        _user_role_mappings.ActionStatus.value == "saving",
    } as Vars;
  });
  //---------------------------------------------
  const CurrentUserRoles = computed(() => {
    return get_current_user_roles(_api);
  });
  //---------------------------------------------
  const CurrentUserRoleGrps = computed(() => {
    return to_user_role_grps(CurrentUserRoles.value);
  });
  //---------------------------------------------
  const CurrentUserDomainRole = computed(() => {
    let mainGroup = session.data.mainGroup;
    console.log("mainGroup", mainGroup);
    for (let ur of CurrentUserRoles.value) {
      if (ur.grp == mainGroup) {
        return ur;
      }
    }
  });
  //---------------------------------------------
  const CurrentUserDomainRoleValue = computed(() => {
    return CurrentUserDomainRole.value?.role ?? -1;
  });
  //---------------------------------------------
  const CurrentItem = computed(() => {
    // 用户的话，需要融合 role 属性
    if ("user" == mainObjType) {
      let data = jsonClone(_users.CurrentItem.value);
      if (!data) {
        return;
      }
      data.roles = CurrentUserRoleGrps.value.join(",");
      data.domainRoleValue = CurrentUserDomainRoleValue.value;
      return data;
    }
    // 其他就直接来
    return _Main.value?.CurrentItem.value;
  });
  //---------------------------------------------
  const listData = computed(() => {
    let list = jsonClone(_Main.value?.listData.value);
    if (!list || _.isEmpty(list)) {
      return list;
    }
    if ("user" == mainObjType) {
      let reList = [];
      for (let li of list) {
        reList.push({
          ...li,
          roles: get_current_user_role_grps(_api, li.id),
        });
      }
    }
    return list;
  });
  //---------------------------------------------
  // 编辑方法
  //---------------------------------------------
  function updateCurrent(delta: Vars) {
    // 防空
    if (!_Main.value) {
      return;
    }
    // 对于 user 的特殊操作
    if ("user" == mainObjType) {
      //..................................
      // 修改了 roles 的话，需要更新关联关系
      if (delta.roles) {
        let new_role_grps = Str.splitIgnoreBlank(delta.roles);
        console.log("delta.roles = ", new_role_grps);
        delete delta.roles;

        // 清除映射
        clear_current_user_role_mappings(_api);

        // 添加新值
        append_current_user_role_mappings_as(_api, new_role_grps);
      }
      //..................................
      // 修改了 domainRoleValue 就需要改掉主组的关系
      if (_.isNumber(delta.domainRoleValue)) {
        let uid = _users.currentId.value;
        let unm = _users.CurrentItem.value?.nm;
        let grp = session.data.mainGroup;
        if (!uid || !unm || !grp) {
          return;
        }
        let roleValue = delta.domainRoleValue;
        delete delta.domainRoleValue;
        let roleName = getUserRoleName(roleValue);
        // 存在就更新
        if (CurrentUserDomainRole.value) {
          _user_role_mappings.updateItem({
            id: CurrentUserDomainRole.value.id,
            role: roleValue,
            type: roleName,
          });
        }
        // 否则就插入
        else {
          _user_role_mappings.appendItem({
            ...gen_user_role_mapping(uid, unm, grp, delta.domainRoleValue),
          });
        }
      }
      //..................................
      // 其他的就直接更新
      if (!_.isEmpty(delta)) {
        _users.updateCurrent(delta);
      }
      //..................................
    }
    // 其他就直接更新
    else {
      _Main.value.updateCurrent(delta);
    }
  }
  //---------------------------------------------
  function getChanges(): Vars[] {
    let re: Vars[] = [];
    re.push(..._users.makeDifferents());
    re.push(..._roles.makeDifferents());
    re.push(..._user_role_mappings.makeDifferents());
    return re;
  }
  //---------------------------------------------
  // 远程方法
  //---------------------------------------------
  async function saveChange({ force = false } = {}) {
    try {
      await Promise.all([
        _users.saveChange({ force }),
        _roles.saveChange({ force }),
        _user_role_mappings.saveChange({ force }),
      ]);
      // 清除本地修改
      _users.resetLocalChange();
      _roles.resetLocalChange();
      _user_role_mappings.resetLocalChange();
    } catch (err) {
      AlertError("Fail to SaveChange", "AuthStore.saveChange", err);
      console.error(err);
    }
  }
  //---------------------------------------------
  async function reload() {
    await Promise.all([
      _users.reload(),
      _roles.reload(),
      _user_role_mappings.reload(),
    ]);
  }
  //---------------------------------------------
  async function refresh(options: RefreshOptions = {}) {
    await Promise.all([
      _users.refresh(options),
      _roles.refresh(options),
      _user_role_mappings.refresh(options),
    ]);
  }
  /*---------------------------------------------
                      
                    输出特性
    
  ---------------------------------------------*/
  return {
    users: _users,
    roles: _roles,
    userRoleMappings: _user_role_mappings,
    Main: _Main,
    UserRoles,
    // 计算属性
    ActionBarVars,
    changed,
    CurrentUserRoles,
    CurrentUserRoleGrps,
    CurrentItem,
    listData,
    // 编辑方法
    getChanges,
    updateCurrent,
    // 远程方法
    saveChange,
    reload,
    refresh,
  };
}
