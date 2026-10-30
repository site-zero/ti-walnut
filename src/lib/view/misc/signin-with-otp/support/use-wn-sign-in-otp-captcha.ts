import { Walnut } from "@site0/ti-walnut";
import { Alert } from "@site0/tijs";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useTemplateRef,
} from "vue";
import type { WnSignInOTPProps } from "../wn-sign-in-otp-types";

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

/** 适配服务器端用 id/ticket 几种形式的返回。 */
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
    validSuccess: (response: TacVerifyResponse) => void;
    btnCloseFun: () => void;
  },
  style: {
    logoUrl: string | null;
  }
) => TacInstance;

type WnSignInOTPCaptchaOptions = {
  props: WnSignInOTPProps;
  getAccount: () => string;
  onSuccess: (ticket: string) => void;
};

let _tac_loading: Promise<TacConstructor> | undefined;

//-----------------------------------------------------
async function _load_tac(): Promise<TacConstructor> {
  if (!_tac_loading) {
    _tac_loading = Promise.all([
      import("#assets/tac/js/tac.min.js"),
      import("#assets/tac/css/tac.css"),
    ]).then(() => {
      const Tac = (window as unknown as { TAC?: TacConstructor }).TAC;
      if (!Tac) {
        throw new Error("TIANAI-CAPTCHA SDK did not register window.TAC");
      }
      return Tac;
    });
    _tac_loading.catch(() => {
      _tac_loading = undefined;
    });
  }
  return _tac_loading;
}

//-----------------------------------------------------
/**
 * 将 Walnut 响应适配为 TAC 格式。必须原地修改，因为 SDK 请求链不采用回调返回值。
 */
function _adapt_captcha_response(response: Record<string, any>) {
  if (response.code === undefined && typeof response.ok === "boolean") {
    response.code = response.ok ? 200 : 4001;
  }

  // 兼容直接返回验证码对象的旧接口。
  if (response.code === undefined && typeof response.type === "string") {
    const captcha = { ...response };
    for (const key of Object.keys(response)) {
      delete response[key];
    }
    response.code = 200;
    response.data = captcha;
  }

  // ImageCaptchaVO 的渲染字段位于 data.data，TAC 从 data 直接读取。
  const captcha = response.data;
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

//-----------------------------------------------------
function _get_captcha_ticket(
  response: TacVerifyResponse
): string | undefined {
  return (
    response.data?.ticket ||
    response.data?.id ||
    response.ticket ||
    response.id
  );
}

//-----------------------------------------------------
export function buildWnSignInOTPApiPath(
  name: string,
  domain?: string
): string {
  const value = domain?.trim();
  return `/a/${name}${value ? `/${encodeURIComponent(value)}` : ""}`;
}

//-----------------------------------------------------
export function useWnSignInOTPCaptcha(options: WnSignInOTPCaptchaOptions) {
  const { props, getAccount, onSuccess } = options;

  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  const _is_captcha_visible = ref(false);
  const $captchaBox = useTemplateRef<HTMLElement>("captchaBox");

  let _tac: TacInstance | undefined;

  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const IsCaptchaVisible = computed(() => _is_captcha_visible.value);

  //-----------------------------------------------------
  // 事件响应
  //-----------------------------------------------------
  function onCaptchaSuccess(response: TacVerifyResponse) {
    const ticket = _get_captcha_ticket(response);
    closeCaptcha();
    if (!ticket) {
      Alert("i18n:wn-sign-in-otp-e-captcha-ticket", { type: "danger" });
      return;
    }
    onSuccess(ticket);
  }

  //-----------------------------------------------------
  // 数据改动
  //-----------------------------------------------------
  function closeCaptcha() {
    _tac?.destroyWindow();
    _tac = undefined;
    _is_captcha_visible.value = false;
  }

  //-----------------------------------------------------
  function _insert_request_chain(tac: TacInstance) {
    tac.config.insertRequestChain(0, {
      preRequest: (type, request) => {
        if (type === "validCaptcha") {
          request.data.domain = props.domain?.trim() || null;
          request.data.account = getAccount();
          request.data.captcha = props.captcha || null;
        }
        return true;
      },
      postRequest: (_type, _request, response) => {
        _adapt_captcha_response(response);
        return true;
      },
    });
  }

  //-----------------------------------------------------
  // 远程操作
  //-----------------------------------------------------
  async function openCaptcha() {
    _is_captcha_visible.value = true;
    try {
      await nextTick();
      if (!$captchaBox.value) {
        throw new Error("Captcha container is not ready");
      }
      const Tac = await _load_tac();
      if (!_is_captcha_visible.value || !$captchaBox.value) {
        return;
      }
      const captchaQuery = { captcha: props.captcha };
      _tac = new Tac(
        {
          bindEl: $captchaBox.value,
          requestCaptchaDataUrl: Walnut.getUrl(
            buildWnSignInOTPApiPath("captcha/get", props.domain),
            captchaQuery
          ),
          validCaptchaUrl: Walnut.getUrl(
            buildWnSignInOTPApiPath("captcha/verify", props.domain)
          ),
          validSuccess: onCaptchaSuccess,
          btnCloseFun: closeCaptcha,
        },
        { logoUrl: null }
      );
      _insert_request_chain(_tac);
      _tac.init();
    } catch (error) {
      console.error("Failed to initialize TIANAI-CAPTCHA", error);
      closeCaptcha();
      Alert("i18n:wn-sign-in-otp-e-captcha-load", { type: "danger" });
    }
  }

  //-----------------------------------------------------
  // 生命周期
  //-----------------------------------------------------
  onBeforeUnmount(() => {
    closeCaptcha();
  });

  //-----------------------------------------------------
  // 暴露接口
  //-----------------------------------------------------
  return {
    // 计算属性
    IsCaptchaVisible,
    // 数据改动
    closeCaptcha,
    // 远程操作
    openCaptcha,
  };
}
