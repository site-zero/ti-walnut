import { effectScope, EffectScope } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWnSignInOTPApi, WnSignInOTPApi } from "./use-wn-sign-in-otp-api";
import { WnSignInOTPProps } from "./wn-sign-in-otp-types";

const { alertMock } = vi.hoisted(() => ({
  alertMock: vi.fn(),
}));

vi.mock("vue", async (importOriginal) => {
  let actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    onBeforeUnmount: vi.fn(),
  };
});

vi.mock("@site0/ti-walnut", () => ({
  Walnut: {
    getUrl: vi.fn(),
    fetchAjax: vi.fn(),
  },
}));

vi.mock("@site0/tijs", () => ({
  Alert: alertMock,
  I18n: {
    get: (key: string) => key,
  },
}));

const _scopes: EffectScope[] = [];

function createApi(props: WnSignInOTPProps = {}) {
  let emit = vi.fn();
  let api: WnSignInOTPApi;
  let scope = effectScope();
  _scopes.push(scope);
  scope.run(() => {
    api = useWnSignInOTPApi(props, { emit });
  });
  return { api: api!, emit };
}

afterEach(() => {
  _scopes.splice(0).forEach((scope) => scope.stop());
  vi.clearAllMocks();
});

describe("useWnSignInOTPApi", () => {
  it("requires both password and OTP by default", () => {
    let { api, emit } = createApi({ otp: "login-otp" });
    expect(api.passwordVisible.value).toBe(true);
    expect(api.otpVisible.value).toBe(true);

    api.info.username = "root";
    api.info.password = "secret";
    api.info.otp_val = "123456";
    api.onClickSubmit();

    expect(emit).toHaveBeenCalledWith("submit", {
      username: "root",
      password: "secret",
      otp: "login-otp",
      otp_val: "123456",
    });
  });

  it("submits only the selected way in PASSWD_OR_OTP mode", () => {
    let { api, emit } = createApi({
      mode: "PASSWD_OR_OTP",
      otp: "login-otp",
    });
    expect(api.modeSelectVisible.value).toBe(true);
    expect(api.authWay.value).toBe("password");

    api.info.username = "root";
    api.info.password = "secret";
    api.info.otp_val = "123456";
    api.onClickSubmit();
    expect(emit).toHaveBeenLastCalledWith("submit", {
      username: "root",
      password: "secret",
    });

    api.setAuthWay("otp");
    expect(api.passwordVisible.value).toBe(false);
    expect(api.otpVisible.value).toBe(true);
    api.onClickSubmit();
    expect(emit).toHaveBeenLastCalledWith("submit", {
      username: "root",
      otp: "login-otp",
      otp_val: "123456",
    });
  });

  it("submits only OTP in OTP_ONLY mode", () => {
    let { api, emit } = createApi({ mode: "OTP_ONLY", otp: "login-otp" });
    expect(api.passwordVisible.value).toBe(false);
    expect(api.otpVisible.value).toBe(true);

    api.info.username = "root";
    api.info.password = "secret";
    api.info.otp_val = "123456";
    api.onClickSubmit();

    expect(emit).toHaveBeenCalledWith("submit", {
      username: "root",
      otp: "login-otp",
      otp_val: "123456",
    });
  });

  it("keeps the original password-only form contract", () => {
    let { api, emit } = createApi({ mode: "PASSWD_ONLY", otp: "login-otp" });
    expect(api.modeSelectVisible.value).toBe(false);
    expect(api.passwordVisible.value).toBe(true);
    expect(api.otpVisible.value).toBe(false);

    api.info.username = "root";
    api.info.password = "secret";
    api.info.otp_val = "123456";
    api.onClickSubmit();

    expect(emit).toHaveBeenCalledWith("submit", {
      username: "root",
      password: "secret",
    });
  });

  it("blocks submission when the visible credentials are incomplete", () => {
    let { api, emit } = createApi();
    api.info.username = "root";
    api.info.password = "secret";
    api.onClickSubmit();

    expect(emit).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith(
      "i18n:wn-sign-in-otp-e-value-empty",
      { type: "warn" }
    );
  });
});
