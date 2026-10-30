import { TiComRace, type TiComInfo } from "@site0/tijs";
import type { App } from "vue";
import i18n from "./i18n";
import WnSignInOTP from "./WnSignInOTP.vue";

const COM_TYPE = "WnSignInOTP";

const WnSignInOTPInfo: TiComInfo = {
  icon: "fas-address-book",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wn-sign-in-otp-com-name",
  i18n,
  com: WnSignInOTP,
  install: (app: App) => {
    app.component(COM_TYPE, WnSignInOTP);
  },
};

export * from "./wn-sign-in-otp-types";
export { WnSignInOTP, WnSignInOTPInfo };