import type { SignInForm } from "@site0/ti-walnut";
import type { Vars } from "@site0/tijs";
import type { useWnSignInOTPApi } from "./use-wn-sign-in-otp-api";

/**
 * 当前采用的认证方式。
 *
 * 使用字符串而不是布尔值，便于以后扩展微信等 OAuth2 认证方式。
 */
export type WnSignInAuthWay = "password" | "otp";

export type WnSignInMode =
  | "PASSWD_AND_OTP"
  | "PASSWD_OR_OTP"
  | "OTP_ONLY"
  | "PASSWD_ONLY";

export type WnSignInOTPEmitter = {
  (event: "submit", payload: SignInForm): void;
};

export type WnSignInOTPProps = {
  /** 根元素自定义样式。 */
  style?: Vars;

  /** 用户名初始值。 */
  username?: string;

  /** 密码初始值。 */
  password?: string;

  /** 登录错误码，非空时显示在表单底部。 */
  errCode?: string;

  /** 域登录模式下需要指定域名，否则表示系统级登录模式。 */
  domain?: string;

  /**
   * 登录框模式。
   *
   * - PASSWD_AND_OTP : 需要密码和 OTP 双重认证
   * - PASSWD_OR_OTP  : 提供密码或者 OTP 均可
   * - OTP_ONLY       : 仅 OTP 认证
   * - PASSWD_ONLY    : 仅需要密码（行为将与 `WnSignIn` 一致）
   *
   * @default "PASSWD_AND_OTP"
   */
  mode?: WnSignInMode;

  /**
   * OTP 采用的 `otpConfigName`。
   * 如果不指定，服务器端会自行决定 OTP 的配置。
   */
  otp?: string;

  /**
   * Captcha 采用的 `captchaName`。
   * 如果不指定，服务器端会自行决定 Captcha 的配置。
   */
  captcha?: string;

  /**
   * OTP 发送成功后的冷却时间，单位为秒。
   * 设置为 `0` 可禁用客户端冷却。
   *
   * @default 60
   */
  otpCooldown?: number;
};

export type WnSignInOTPApi = ReturnType<typeof useWnSignInOTPApi>;
