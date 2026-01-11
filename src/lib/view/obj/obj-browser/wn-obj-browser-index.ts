import { TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnObjBrowser from "./WnObjBrowser.vue";

const COM_TYPE = "WnObjBrowser";

const en_us = {
  "com-name": "WnObjBrowser",
};
const zh_cn = {
  "com-name": "对象浏览器",
};

const WnObjBrowserInfo: TiComInfo = {
  icon: "fas-address-book",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wn-obj-browser-com-name",
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnObjBrowser,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjBrowserInfo);
  },
  defaultProps: "",
  exampleProps: [],
};

export * from "./wn-obj-browser-types";
export { WnObjBrowser, WnObjBrowserInfo };
export * from "./skybar/wn-obj-browser-sky-bar-index";
