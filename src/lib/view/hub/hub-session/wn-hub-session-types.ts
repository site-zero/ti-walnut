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
};
