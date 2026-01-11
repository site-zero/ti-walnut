import { TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnObjBrowserSkyBar from "./WnObjBrowserSkyBar.vue";

const COM_TYPE = "WnObjBrowserSkyBar";

const en_us = {
  'com-name': 'WnObjBrowserSkyBar',
};
const zh_cn = {
  'com-name': 'WnObjBrowserSkyBar',
};

const WnObjBrowserSkyBarInfo: TiComInfo = {
  icon: "fas-address-book",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wob-skybar-com-name",
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnObjBrowserSkyBar,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjBrowserSkyBarInfo);
  },
  defaultProps: "",
  exampleProps: [],
};

export * from "./wob-skybar-types";
export { WnObjBrowserSkyBar, WnObjBrowserSkyBarInfo };