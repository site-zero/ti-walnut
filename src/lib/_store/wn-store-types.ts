import { IntersectionType } from "@site0/tijs";
import { RdsListStoreApi } from "./rds/use-rds-list.store";
import { StdListStoreApi } from "./std/use-std-list.store";

export type StoreListApi = IntersectionType<StdListStoreApi, RdsListStoreApi>;

// 用户角色类型定义
const UserRoleTypes = {
  ADMIN: 1,
  MEMBER: 10,
  GUEST: 0,
  BLOCK: -1,
};
export type UserRoleType = keyof typeof UserRoleTypes;

// 用户角色映射
export type UserRoleMapping = {
  /**
   * 本角色映射 ID
   */
  id: string;
  /**
   * 角色组名（也可以说是角色名）
   */
  grp: string;
  /**
   * 用户 ID
   */
  uid: string;
  /**
   * 用户登录名
   */
  unm: string;
  /**
   * 角色类型名: GUEST|ADMIN|MEMBER|BLOCK
   */
  type: UserRoleType;
  /**
   * 角色角色值
   * - GUEST(0)
   * - ADMIN(1)
   * - MEMBER(10)
   * - BLOCK(-1)
   */
  role: number;
  /**
   * 特殊权限
   */
  privileges?: string[];
};

export function toUserRoleName(
  type: string,
  dft: UserRoleType = "GUEST"
): UserRoleType {
  if (/^(ADMIN|MEMBER|GUEST|BLOCK)$/.test(type)) {
    return type as UserRoleType;
  }
  return dft;
}

export function toUserRoleValue(input: any, dft: number = 0): number {
  if (input == 0 || input == 1 || input == 10 || input == -1) {
    return input;
  }
  return dft;
}

export function getUserRoleValue(type: UserRoleType): number {
  return UserRoleTypes[type] || 0;
}

export function getUserRoleName(
  role: number,
  dft: UserRoleType = "GUEST"
): UserRoleType {
  switch (role) {
    case 0:
      return "GUEST";
    case 1:
      return "ADMIN";
    case 10:
      return "MEMBER";
    case -1:
      return "BLOCK";
    default:
      return dft;
  }
}
