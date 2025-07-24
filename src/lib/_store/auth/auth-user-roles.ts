import { Alg, jsonClone, Str, Vars } from "@site0/tijs";
import _ from "lodash";
import {
  getUserRoleName,
  getUserRoleValue,
  toUserRoleName,
  toUserRoleValue,
  UserRoleMapping,
  UserRoleType,
} from "../wn-store-types";
import { _auth_inner_api } from "./use-auth.store";

/**
 * 获取指定用户在当前主分组下的角色映射。
 * 如果未提供用户 ID，则默认使用当前用户的 ID。
 * @param api - 认证内部 API 实例
 * @param uid - 用户 ID，可选，默认为当前用户 ID
 * @returns 返回该用户在当前主分组下的角色映射，如果未找到则返回 undefined
 */
export function get_domain_role(api: _auth_inner_api, uid?: string) {
  const { _users, session } = api;
  uid = uid || _users.currentId.value;
  let mainGroup = session.data.mainGroup;
  // 防空
  if (!uid || !mainGroup) {
    return;
  }
  let urMappings = get_user_roles(api, uid);
  for (let ur of urMappings) {
    if (ur.grp == mainGroup) {
      return ur;
    }
  }
}

export function get_domain_role_value(api: _auth_inner_api, uid?: string) {
  return get_domain_role(api, uid)?.role;
}

/**
 * 为当前用户追加指定分组的角色映射
 * @param api - 认证内部 API 实例
 * @param grps - 分组名称数组
 * @param roleType - 用户角色类型，默认为 "MEMBER"
 */
export function append_current_user_role_mappings_as(
  api: _auth_inner_api,
  grps: string[],
  roleType: UserRoleType = "MEMBER"
) {
  // 防空
  if (_.isEmpty(grps)) {
    return;
  }
  const { _users, _user_role_mappings } = api;
  let uid = _users.currentId.value;
  let unm = _users.CurrentItem.value?.nm;
  // 再度防空
  if (!uid || !unm) {
    return;
  }
  let roleValue = getUserRoleValue(roleType);

  // 添加新置顶的映射
  for (let grp of grps) {
    let u_r: UserRoleMapping = {
      id: Alg.genSnowQ(10),
      grp,
      uid,
      unm,
      type: roleType,
      role: roleValue,
    };
    _user_role_mappings.appendItem({ ...u_r });
  }
}

/**
 * 清除当前用户的角色映射
 * @param api - 认证内部 API 实例
 */
export function clear_current_user_role_mappings(
  api: _auth_inner_api,
  expectGroups?: string[] | string
) {
  const { _users, _user_role_mappings } = api;
  let uid = _users.currentId.value;
  let unm = _users.CurrentItem.value?.nm;
  // 防空
  if (!uid || !unm) {
    return;
  }

  // 准备排除的组
  let ex_grps = _.isEmpty(expectGroups) ? [] : _.concat([], expectGroups);

  // 找到全部当前用户的映射
  let usrRoles = _user_role_mappings.findItemsBy((it) => {
    return it.uid === uid && ex_grps.indexOf(it.grp) < 0;
  });

  // 从映射里删除
  let u_r_ids = usrRoles.map((ur) => ur.id);
  _user_role_mappings.removeItems(u_r_ids);
}

/**
 * 获取当前用户的角色映射列表
 * @param api - 认证内部 API 实例
 * @returns 当前用户的角色映射列表
 */
export function get_user_roles(
  api: _auth_inner_api,
  uid?: string
): UserRoleMapping[] {
  const { _users, UserRoles } = api;
  uid = uid || _users.currentId.value;
  if (uid) {
    let re = UserRoles.value.get(uid) || [];
    return jsonClone(re);
  }
  return [];
}

/**
 * 获取当前用户的角色分组名称列表
 * @param api - 认证内部 API 实例
 * @param uid - 用户 ID，可选，默认为当前用户 ID
 * @returns 分组名称数组
 */
export function get_user_role_grps(
  api: _auth_inner_api,
  uid?: string,
  expectGroups?: string[] | string
): string[] {
  // 准备排除的组
  let ex_grps = _.isEmpty(expectGroups) ? [] : _.concat([], expectGroups);

  let urMappings = get_user_roles(api, uid);
  return to_user_role_grps(urMappings).filter(
    (grp) => ex_grps.indexOf(grp) < 0
  );
}

/**
 * 将用户角色映射列表转换为分组名称数组
 * @param urMappings - 用户角色映射列表
 * @returns 分组名称数组
 */
export function to_user_role_grps(urMappings: UserRoleMapping[]): string[] {
  let list: string[] = [];
  for (let it of urMappings) {
    if (it.grp && /^(ADMIN|MEMBER)$/.test(it.type)) {
      list.push(it.grp);
    }
  }
  return list;
}

/**
 * 将任意变量转换为用户角色映射对象
 * @param mappingItem - 待转换的变量
 * @returns 转换后的用户角色映射对象
 */
export function any_to_user_role_mapping(mappingItem: Vars): UserRoleMapping {
  // 追求对 privileges 的最大兼容性
  let pvg = mappingItem.privileges || [];
  let privileges: string[] = [];
  if (_.isString(pvg)) {
    privileges = Str.splitIgnoreBlank(pvg);
  } else if (_.isArray(pvg)) {
    privileges = pvg;
  }

  // 确保类型名称
  let roleType = toUserRoleName(mappingItem.type, "GUEST");
  let roleValue = getUserRoleValue(roleType);
  roleValue = toUserRoleValue(mappingItem.role, roleValue);

  // 返回对象
  return {
    id: mappingItem.id,
    grp: mappingItem.grp,
    uid: mappingItem.uid,
    unm: mappingItem.unm,
    type: roleType,
    role: roleValue,
    privileges,
  };
}

export function gen_user_role_mapping(
  uid: string,
  unm: string,
  grp: string,
  role: string | number,
  privileges?: string[]
): UserRoleMapping {
  // 自动分析 roleTypeName/Value
  let roleType: UserRoleType;
  let roleValue: number;
  if (_.isNumber(role)) {
    roleValue = toUserRoleValue(role, 0);
    roleType = getUserRoleName(roleValue, "GUEST");
  } else {
    roleType = toUserRoleName(role, "GUEST");
    roleValue = getUserRoleValue(roleType);
  }

  return {
    id: Alg.genSnowQ(10),
    uid,
    unm,
    grp,
    type: roleType,
    role: roleValue,
    privileges,
  };
}
