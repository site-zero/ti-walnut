import { SignInForm, Walnut } from "@site0/ti-walnut";
import { Alert, I18n } from "@site0/tijs";
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";
import {
  WnSignInAuthWay,
  WnSignInMode,
  WnSignInOTPEmitter,
  WnSignInOTPProps,
} from "./wn-sign-in-otp-types";

export type WnSignInOTPApi = ReturnType<typeof useWnSignInOTPApi>;
export type WnSignInOTPSetup = {
  emit: WnSignInOTPEmitter;
};

type TacInstance = {
  init(): void;
  destroyWindow(): void;
  config: {
    insertRequestChain(
      index: number,
      chain: {
        preRequest?: (
          type: string,
          request: { data: Record<string, any> }
        ) => boolean;
        postRequest: (
          type: string,
          request: unknown,
          response: Record<string, any>
        ) => boolean;
      }
    ): void;
  };
};

type TacVerifyResponse = {
  id?: string;
  ticket?: string;
  data?: {
    id?: string;
    ticket?: string;
  };
};

type TacConstructor = new (
  config: {
    bindEl: HTMLElement;
    requestCaptchaDataUrl: string;
    validCaptchaUrl: string;
    validSuccess: (res: TacVerifyResponse) => void;
    btnCloseFun: () => void;
  },
  style: {
    logoUrl: string | null;
  }
) => TacInstance;

let _tac_loading: Promise<TacConstructor> | undefined;

async function loadTAC(): Promise<TacConstructor> {
  if (!_tac_loading) {
    _tac_loading = Promise.all([
      import("../../../../assets/tac/js/tac.min.js"),
      import("../../../../assets/tac/css/tac.css"),
    ]).then(() => {
      let TAC = (window as unknown as { TAC?: TacConstructor }).TAC;
      if (!TAC) {
        throw new Error("TIANAI-CAPTCHA SDK did not register window.TAC");
      }
      return TAC;
    });
    _tac_loading.catch(() => {
      _tac_loading = undefined;
    });
  }
  return _tac_loading;
}

function adaptCaptchaResponse(response: Record<string, any>) {
  // TAC 使用 code 判断结果，Walnut 使用 ok。响应必须原地修改，
  // 因为 SDK 的请求链不会采用回调返回值。
  if (response.code === undefined && typeof response.ok === "boolean") {
    response.code = response.ok ? 200 : 4001;
  }

  // 兼容直接返回验证码对象的旧接口。
  if (response.code === undefined && typeof response.type === "string") {
    let data = { ...response };
    for (let key of Object.keys(response)) {
      delete response[key];
    }
    response.code = 200;
    response.data = data;
  }

  // ImageCaptchaVO 的渲染字段位于 data.data，TAC 从 data 直接读取。
  let captcha = response.data;
  if (
    response.code === 200 &&
    captcha?.type &&
    captcha.data &&
    typeof captcha.data === "object"
  ) {
    response.data = {
      ...captcha,
      ...captcha.data,
    };
  }
}

function getCaptchaTicket(res: TacVerifyResponse): string | undefined {
  return res.data?.ticket || res.data?.id || res.ticket || res.id;
}

export function useWnSignInOTPApi(
  props: WnSignInOTPProps,
  setup: WnSignInOTPSetup
) {
  const { emit } = setup;

  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  const info = reactive<SignInForm>({
    username: props.username,
    password: props.password,
    otp: props.otp,
    otp_val: "",
  });
  const authWay = ref<WnSignInAuthWay>("password");
  const cooldown = ref(0);
  const sending = ref(false);
  const captchaVisible = ref(false);
  const captchaBox = ref<HTMLElement>();

  let _tac: TacInstance | undefined;
  let _cooldown_timer: number | undefined;

  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const mode = computed<WnSignInMode>(() => props.mode || "PASSWD_AND_OTP");
  const modeSelectVisible = computed(() => mode.value === "PASSWD_OR_OTP");
  const passwordVisible = computed(() => {
    if (mode.value === "PASSWD_OR_OTP") {
      return authWay.value === "password";
    }
    return mode.value === "PASSWD_AND_OTP" || mode.value === "PASSWD_ONLY";
  });
  const otpVisible = computed(() => {
    if (mode.value === "PASSWD_OR_OTP") {
      return authWay.value === "otp";
    }
    return mode.value === "PASSWD_AND_OTP" || mode.value === "OTP_ONLY";
  });
  const otpButtonDisabled = computed(
    () => sending.value || captchaVisible.value || cooldown.value > 0
  );

  //-----------------------------------------------------
  // 操作函数
  //-----------------------------------------------------
  function setAuthWay(way: WnSignInAuthWay) {
    authWay.value = way;
  }

  function closeCaptcha() {
    _tac?.destroyWindow();
    _tac = undefined;
    captchaVisible.value = false;
  }

  function clearCooldown() {
    if (_cooldown_timer !== undefined) {
      window.clearInterval(_cooldown_timer);
      _cooldown_timer = undefined;
    }
  }

  function startCooldown() {
    clearCooldown();
    let seconds = Math.max(0, Math.floor(props.otpCooldown ?? 60));
    cooldown.value = seconds;
    if (seconds <= 0) {
      return;
    }
    _cooldown_timer = window.setInterval(() => {
      cooldown.value -= 1;
      if (cooldown.value <= 0) {
        clearCooldown();
      }
    }, 1000);
  }

  function apiPath(name: string): string {
    let domain = props.domain?.trim();
    return `/a/${name}${domain ? `/${encodeURIComponent(domain)}` : ""}`;
  }

  //-----------------------------------------------------
  // 数据校验
  //-----------------------------------------------------
  function validateSubmit(): boolean {
    if (mode.value === "PASSWD_ONLY") {
      if (!info.username || !info.password) {
        Alert("i18n:wn-signin-e-unm-pwd-empty", { type: "warn" });
        return false;
      }
      return true;
    }
    if (!info.username) {
      Alert("i18n:wn-sign-in-otp-e-unm-empty", { type: "warn" });
      return false;
    }
    if (passwordVisible.value && !info.password) {
      Alert("i18n:wn-sign-in-otp-e-pass-empty", { type: "warn" });
      return false;
    }
    if (otpVisible.value && !info.otp_val) {
      Alert("i18n:wn-sign-in-otp-e-value-empty", { type: "warn" });
      return false;
    }
    return true;
  }

  function onClickSubmit() {
    if (!validateSubmit()) {
      return;
    }
    let payload: SignInForm = {
      username: info.username,
    };
    if (passwordVisible.value) {
      payload.password = info.password;
    }
    if (otpVisible.value) {
      payload.otp = props.otp;
      payload.otp_val = info.otp_val;
    }
    emit("submit", payload);
  }

  //-----------------------------------------------------
  // 远程操作
  //-----------------------------------------------------
  async function sendOtp(ticket: string) {
    if (sending.value) {
      return;
    }
    sending.value = true;
    try {
      let url = Walnut.getUrl(apiPath("otp/send"), {
        otp: props.otp,
        captcha: props.captcha,
        ticket,
        account: info.username,
      });
      let re = await Walnut.fetchAjax(url);
      if (re.ok) {
        startCooldown();
      } else {
        Alert(I18n.get(re.errCode || "wn-sign-in-otp-e-send"), {
          type: "danger",
        });
      }
    } catch (err) {
      console.error("Failed to send OTP", err);
      Alert("i18n:wn-sign-in-otp-e-send", { type: "danger" });
    } finally {
      sending.value = false;
    }
  }

  async function onCaptchaSuccess(res: TacVerifyResponse) {
    let ticket = getCaptchaTicket(res);
    closeCaptcha();
    if (!ticket) {
      Alert("i18n:wn-sign-in-otp-e-captcha-ticket", { type: "danger" });
      return;
    }
    await sendOtp(ticket);
  }

  async function onClickGetOtp() {
    if (otpButtonDisabled.value) {
      return;
    }
    if (!info.username) {
      Alert("i18n:wn-sign-in-otp-e-unm-empty", { type: "warn" });
      return;
    }

    captchaVisible.value = true;
    try {
      await nextTick();
      if (!captchaBox.value) {
        throw new Error("Captcha container is not ready");
      }
      let TAC = await loadTAC();
      if (!captchaVisible.value || !captchaBox.value) {
        return;
      }
      let captchaQuery = { captcha: props.captcha };
      _tac = new TAC(
        {
          bindEl: captchaBox.value,
          requestCaptchaDataUrl: Walnut.getUrl(
            apiPath("captcha/get"),
            captchaQuery
          ),
          validCaptchaUrl: Walnut.getUrl(apiPath("captcha/verify")),
          validSuccess: (res) => {
            void onCaptchaSuccess(res);
          },
          btnCloseFun: closeCaptcha,
        },
        { logoUrl: null }
      );
      _tac.config.insertRequestChain(0, {
        preRequest: (type, request) => {
          if (type === "validCaptcha") {
            request.data.domain = props.domain?.trim() || null;
            request.data.account = info.username;
            request.data.captcha = props.captcha || null;
          }
          return true;
        },
        postRequest: (_type, _request, response) => {
          adaptCaptchaResponse(response);
          return true;
        },
      });
      _tac.init();
    } catch (err) {
      console.error("Failed to initialize TIANAI-CAPTCHA", err);
      closeCaptcha();
      Alert("i18n:wn-sign-in-otp-e-captcha-load", { type: "danger" });
    }
  }

  //-----------------------------------------------------
  // 数据改动与清理
  //-----------------------------------------------------
  watch(
    () => props.otp,
    (value) => {
      info.otp = value;
    }
  );
  watch(
    () => props.mode,
    (value) => {
      if (value === "PASSWD_ONLY") {
        closeCaptcha();
      }
    }
  );
  onBeforeUnmount(() => {
    closeCaptcha();
    clearCooldown();
  });

  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    info,
    authWay,
    cooldown,
    sending,
    captchaVisible,
    captchaBox,
    modeSelectVisible,
    passwordVisible,
    otpVisible,
    otpButtonDisabled,
    setAuthWay,
    closeCaptcha,
    onClickSubmit,
    onClickGetOtp,
  };
}
