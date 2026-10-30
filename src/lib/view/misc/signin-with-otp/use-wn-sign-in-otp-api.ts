import type { SignInForm } from "@site0/ti-walnut";
import { Walnut } from "@site0/ti-walnut";
import { Alert } from "@site0/tijs";
import { computed, reactive, ref } from "vue";
import {
  buildWnSignInOTPApiPath,
  useWnSignInOTPCaptcha,
  useWnSignInOTPCooldown,
} from "./support";
import type {
  WnSignInAuthWay,
  WnSignInMode,
  WnSignInOTPEmitter,
  WnSignInOTPProps,
} from "./wn-sign-in-otp-types";

type WnSignInOTPApiSetup = {
  emit: WnSignInOTPEmitter;
};

//-----------------------------------------------------
export function useWnSignInOTPApi(
  props: WnSignInOTPProps,
  setup: WnSignInOTPApiSetup
) {
  const { emit } = setup;

  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  const _info = reactive<SignInForm>({
    username: props.username,
    password: props.password,
    otp: props.otp,
    otp_val: "",
  });
  const _auth_way = ref<WnSignInAuthWay>("password");
  //-----------------------------------------------------
  const _otp_captcha = useWnSignInOTPCaptcha({
    props,
    getAccount: () => _info.username || "",
    onSuccess: _send_otp,
  });
  const _otp_cooldown = useWnSignInOTPCooldown(props);

  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const Mode = computed<WnSignInMode>(() => props.mode || "PASSWD_AND_OTP");
  const ShowModeSelect = computed(() => Mode.value === "PASSWD_OR_OTP");
  const ShowPassword = computed(() => {
    if (Mode.value === "PASSWD_OR_OTP") {
      return _auth_way.value === "password";
    }
    return Mode.value === "PASSWD_AND_OTP" || Mode.value === "PASSWD_ONLY";
  });
  const ShowOtp = computed(() => {
    if (Mode.value === "PASSWD_OR_OTP") {
      return _auth_way.value === "otp";
    }
    return Mode.value === "PASSWD_AND_OTP" || Mode.value === "OTP_ONLY";
  });

  //-----------------------------------------------------
  const AuthWay = computed(() => _auth_way.value);

  //-----------------------------------------------------
  const Cooldown = _otp_cooldown.Cooldown;
  const IsSending = _otp_cooldown.IsSending;
  const IsCaptchaVisible = _otp_captcha.IsCaptchaVisible;
  const IsOtpButtonDisabled = computed(
    () =>
      IsSending.value || IsCaptchaVisible.value || _otp_cooldown.IsActive.value
  );

  //-----------------------------------------------------
  // 事件响应
  //-----------------------------------------------------
  function onClickSubmit() {
    if (!_validate_submit()) {
      return;
    }
    const payload: SignInForm = {
      username: _info.username,
    };
    if (ShowPassword.value) {
      payload.password = _info.password;
    }
    if (ShowOtp.value) {
      payload.otp = props.otp;
      payload.otp_val = _info.otp_val;
    }
    emit("submit", payload);
  }

  //-----------------------------------------------------
  async function onClickGetOtp() {
    if (IsOtpButtonDisabled.value) {
      return;
    }
    if (!_info.username) {
      Alert("i18n:wn-sign-in-otp-e-unm-empty", { type: "warn" });
      return;
    }
    await _otp_captcha.openCaptcha();
  }

  //-----------------------------------------------------
  // 数据校验
  //-----------------------------------------------------
  function _validate_submit(): boolean {
    if (Mode.value === "PASSWD_ONLY") {
      if (!_info.username || !_info.password) {
        Alert("i18n:wn-signin-e-unm-pwd-empty", { type: "warn" });
        return false;
      }
      return true;
    }
    if (!_info.username) {
      Alert("i18n:wn-sign-in-otp-e-unm-empty", { type: "warn" });
      return false;
    }
    if (ShowPassword.value && !_info.password) {
      Alert("i18n:wn-sign-in-otp-e-pass-empty", { type: "warn" });
      return false;
    }
    if (ShowOtp.value && !_info.otp_val) {
      Alert("i18n:wn-sign-in-otp-e-value-empty", { type: "warn" });
      return false;
    }
    return true;
  }

  //-----------------------------------------------------
  // 数据改动
  //-----------------------------------------------------
  function setAuthWay(way: WnSignInAuthWay) {
    _auth_way.value = way;
  }

  //-----------------------------------------------------
  // 远程操作
  //-----------------------------------------------------
  async function _send_otp(ticket: string) {
    if (IsSending.value || _otp_cooldown.IsActive.value) {
      return;
    }

    const form: Record<string, string> = {
      account: _info.username || "",
      ticket,
    };
    if (props.otp) {
      form.otp = props.otp;
    }
    if (props.captcha) {
      form.captcha = props.captcha;
    }

    _otp_cooldown.startSending();
    try {
      const result = await Walnut.postFormToGetAjax(
        buildWnSignInOTPApiPath("otp/send", props.domain),
        form
      );
      if (!result?.ok) {
        Alert("i18n:wn-sign-in-otp-e-send", { type: "danger" });
        return;
      }
      _otp_cooldown.startCooldown();
    } catch (error) {
      console.error("Failed to send OTP", error);
      Alert("i18n:wn-sign-in-otp-e-send", { type: "danger" });
    } finally {
      _otp_cooldown.stopSending();
    }
  }

  //-----------------------------------------------------
  // 暴露接口
  //-----------------------------------------------------
  return {
    // 数据模型
    info: _info,
    // 计算属性
    AuthWay,
    Cooldown,
    IsSending,
    IsCaptchaVisible,
    ShowModeSelect,
    ShowPassword,
    ShowOtp,
    IsOtpButtonDisabled,
    // 事件响应
    onClickSubmit,
    onClickGetOtp,
    // 数据改动
    setAuthWay,
    closeCaptcha: _otp_captcha.closeCaptcha,
  };
}
