import { TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnHubSession from "./WnHubSession.vue";

const COM_TYPE = "WnHubSession";

const en_us = {
  "com-name": "WnHubSession",
};
const zh_cn = {
  "com-name": "WnHubSession",
};

const WnHubSessionInfo: TiComInfo = {
  icon: "fas-address-book",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wn-hub-session-com-name",
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnHubSession,
  install: (app: App) => {
    app.component(COM_TYPE, WnHubSessionInfo);
  },
  defaultProps: "",
  exampleProps: [],
};

export * from "./support";
export * from "./wn-hub-session-types";
export { WnHubSession, WnHubSessionInfo };
