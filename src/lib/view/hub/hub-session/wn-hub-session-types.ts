import { CommonProps } from "@site0/tijs";

export type WnHubSessionEmitter = {
  (event: "logout"): void;
};

export type WnHubSessionProps = CommonProps & {
  keepName?: string;

  /**
   * 默认为 `~/www/login`
   */
  loginSitePath?: string;

  /**
   * 默认为 `"ADMIN"`
   */
  adminRole?: string;

  /**
   * 是否显示“以其他用户身份登录”的选项
   */
  showSignInByAnotherUser?: boolean;

  /**
   * 改变密码，强度不能低于指定的强度 `1-5`
   * 默认 `0`， 表示不检查密码强度
   */
  passwdStrength?:number
};
