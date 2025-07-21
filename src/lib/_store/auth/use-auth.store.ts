import { Vars } from "@site0/tijs";
import { computed } from "vue";
import {
  GlobalStatusApi,
  RdsListStoreOptions,
  RefreshOptions,
  StdListStoreOptions,
  useRdsListStore,
  useStdListStore,
} from "../..";
import { StoreListApi } from "../wn-store-types";
import { getCurrentUserRoles } from "./auth-user-roles";

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

export function useAuthStore(options: AuthStoreOptions) {
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
  const CurrentUserRoles = computed(() => {
    return getCurrentUserRoles(_users, _user_role_mappings);
  });
  //---------------------------------------------
  const CurrentUserRoleGrps = computed(() => {
    let list: string[] = [];
    for (let it of CurrentUserRoles.value) {
      if (it.grp && /^(ADMIN|MEMBER)$/.test(it.type)) {
        list.push(it.grp);
      }
    }
    return list;
  });
  //---------------------------------------------
  // 编辑方法
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
    await Promise.all([
      _users.saveChange({ force }),
      _roles.saveChange({ force }),
      _user_role_mappings.saveChange({ force }),
    ]);
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
    // 计算属性
    Main: _Main,
    changed,
    CurrentUserRoles,
    CurrentUserRoleGrps,
    // 编辑方法
    getChanges,
    // 远程方法
    saveChange,
    reload,
    refresh,
  };
}
