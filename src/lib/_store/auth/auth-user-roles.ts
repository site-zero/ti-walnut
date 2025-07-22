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
export function clear_current_user_role_mappings(api: _auth_inner_api) {
  const { _users, _user_role_mappings } = api;
  let uid = _users.currentId.value;
  let unm = _users.CurrentItem.value?.nm;
  // 防空
  if (!uid || !unm) {
    return;
  }

  // 找到全部当前用户的映射
  let usrRoles = _user_role_mappings.findItemsBy((it) => it.uid === uid);

  // 从映射里删除
  let u_r_ids = usrRoles.map((ur) => ur.id);
  _user_role_mappings.removeItems(u_r_ids);
}

/**
 * 获取当前用户的角色映射列表
 * @param api - 认证内部 API 实例
 * @returns 当前用户的角色映射列表
 */
export function get_current_user_roles(
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
export function get_current_user_role_grps(
  api: _auth_inner_api,
  uid?: string
): string[] {
  let urMappings = get_current_user_roles(api, uid);
  return to_user_role_grps(urMappings);
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


