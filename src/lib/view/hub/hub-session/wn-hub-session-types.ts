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
};
