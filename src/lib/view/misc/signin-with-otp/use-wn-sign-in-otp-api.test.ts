import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createRenderer,
  effectScope,
  h,
  nextTick,
  reactive,
  ssrContextKey,
  type App,
  type EffectScope,
} from "vue";
import WnSignInOTP from "./WnSignInOTP.vue";
import * as SignInOTPApi from "./use-wn-sign-in-otp-api";
import { useWnSignInOTPApi } from "./use-wn-sign-in-otp-api";
import type {
  WnSignInOTPApi,
  WnSignInOTPProps,
} from "./wn-sign-in-otp-types";

const { alertMock } = vi.hoisted(() => ({
  alertMock: vi.fn(),
}));

vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    onBeforeUnmount: vi.fn(),
    useTemplateRef: () => actual.ref<HTMLElement>(),
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
const _apps: App[] = [];

//-----------------------------------------------------
function createApi(props: WnSignInOTPProps = {}) {
  const emit = vi.fn();
  const scope = effectScope();
  _scopes.push(scope);
  const api: WnSignInOTPApi = scope.run(() =>
    useWnSignInOTPApi(props, { emit })
  )!;
  return { api, emit };
}

//-----------------------------------------------------
/** 仅挂载真实 SFC 的 setup，验证 Props 接线；不渲染 DOM 或加载验证码 SDK。 */
function mountComponent(props: WnSignInOTPProps) {
  const renderer = createRenderer<object, object>({
    createElement: () => ({}),
    createText: () => ({}),
    createComment: () => ({}),
    insert: () => {},
    remove: () => {},
    setText: () => {},
    setElementText: () => {},
    patchProp: () => {},
    parentNode: () => null,
    nextSibling: () => null,
  });
  const original = SignInOTPApi.useWnSignInOTPApi;
  let api: WnSignInOTPApi | undefined;
  vi.spyOn(SignInOTPApi, "useWnSignInOTPApi").mockImplementation((...args) => {
    api = original(...args);
    vi.spyOn(api, "closeCaptcha");
    return api;
  });
  const component = Object.assign({}, WnSignInOTP, {
    render: () => null,
  });
  const app = renderer.createApp({
    setup: () => () => h(component, props),
  });
  app.provide(ssrContextKey, {});
  _apps.push(app);
  app.mount({});
  if (!api) {
    throw new Error("WnSignInOTP setup did not create its API");
  }
  return api;
}

//-----------------------------------------------------
afterEach(() => {
  _apps.splice(0).forEach((app) => app.unmount());
  _scopes.splice(0).forEach((scope) => scope.stop());
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("useWnSignInOTPApi", () => {
  it("requires both password and OTP by default", () => {
    const { api, emit } = createApi({ otp: "login-otp" });
    expect(api.ShowPassword.value).toBe(true);
    expect(api.ShowOtp.value).toBe(true);

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
    const { api, emit } = createApi({
      mode: "PASSWD_OR_OTP",
      otp: "login-otp",
    });
    expect(api.ShowModeSelect.value).toBe(true);
    expect(api.AuthWay.value).toBe("password");

    api.info.username = "root";
    api.info.password = "secret";
    api.info.otp_val = "123456";
    api.onClickSubmit();
    expect(emit).toHaveBeenLastCalledWith("submit", {
      username: "root",
      password: "secret",
    });

    api.setAuthWay("otp");
    expect(api.ShowPassword.value).toBe(false);
    expect(api.ShowOtp.value).toBe(true);
    api.onClickSubmit();
    expect(emit).toHaveBeenLastCalledWith("submit", {
      username: "root",
      otp: "login-otp",
      otp_val: "123456",
    });
  });

  it("submits only OTP in OTP_ONLY mode", () => {
    const { api, emit } = createApi({ mode: "OTP_ONLY", otp: "login-otp" });
    expect(api.ShowPassword.value).toBe(false);
    expect(api.ShowOtp.value).toBe(true);

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
    const { api, emit } = createApi({
      mode: "PASSWD_ONLY",
      otp: "login-otp",
    });
    expect(api.ShowModeSelect.value).toBe(false);
    expect(api.ShowPassword.value).toBe(true);
    expect(api.ShowOtp.value).toBe(false);

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
    const { api, emit } = createApi();
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

describe("WnSignInOTP Props wiring", () => {
  it("syncs OTP configuration without changing entered credentials", async () => {
    const props = reactive<WnSignInOTPProps>({ otp: "initial-otp" });
    const api = mountComponent(props);
    api.info.username = "root";
    api.info.password = "secret";
    api.info.otp_val = "123456";

    props.otp = "updated-otp";
    await nextTick();
    expect(api.info).toEqual({
      username: "root",
      password: "secret",
      otp: "updated-otp",
      otp_val: "123456",
    });

    props.otp = undefined;
    await nextTick();
    expect(api.info.otp).toBeUndefined();
  });

  it("closes captcha only when mode changes to PASSWD_ONLY", async () => {
    const props = reactive<WnSignInOTPProps>({ mode: "PASSWD_ONLY" });
    const { closeCaptcha } = mountComponent(props);
    expect(closeCaptcha).not.toHaveBeenCalled();

    props.mode = "OTP_ONLY";
    await nextTick();
    expect(closeCaptcha).not.toHaveBeenCalled();

    props.mode = "PASSWD_ONLY";
    await nextTick();
    expect(closeCaptcha).toHaveBeenCalledTimes(1);

    props.mode = "PASSWD_ONLY";
    await nextTick();
    expect(closeCaptcha).toHaveBeenCalledTimes(1);
  });
});
