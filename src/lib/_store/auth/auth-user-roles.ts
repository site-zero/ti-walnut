import { Str, Vars } from "@site0/tijs";
import {
  getUserRoleTypeValue,
  StoreListApi,
  toUserRoleType,
  toUserRoleTypeValue,
  UserRoleMapping,
} from "../wn-store-types";
import _ from "lodash";

export function getCurrentUserRoles(
  _users: StoreListApi,
  _user_role_mappings: StoreListApi
): UserRoleMapping[] {
  let list: UserRoleMapping[] = [];
  let uid = _users.currentId.value;
  if (uid) {
    let mappings = _user_role_mappings.listData.value;
    for (let mapping of mappings) {
      if (mapping.uid == uid) {
        let it = anyToUserRoleMapping(mapping);
        list.push(it);
      }
    }
  }
  return list;
}

export function anyToUserRoleMapping(mappingItem: Vars): UserRoleMapping {
  // 追求对 privileges 的最大兼容性
  let pvg = mappingItem.privileges || [];
  let privileges: string[] = [];
  if (_.isString(pvg)) {
    privileges = Str.splitIgnoreBlank(pvg);
  } else if (_.isArray(pvg)) {
    privileges = pvg;
  }

  // 确保类型名称
  let roleType = toUserRoleType(mappingItem.type, "GUEST");
  let roleValue = getUserRoleTypeValue(roleType);
  roleValue = toUserRoleTypeValue(mappingItem.role, roleValue);

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
