import { TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnObjTitle from "./WnObjTitle.vue";

const COM_TYPE = "WnObjTitle";

const en_us = {
  "com-name": "WnObjTitle",
};
const zh_cn = {
  "com-name": "WnObjTitle",
};

const WnObjTitleInfo: TiComInfo = {
  icon: "fas-address-book",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wn-obj-title-com-name",
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnObjTitle,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjTitleInfo);
  },
  defaultProps: "",
  exampleProps: [],
};

export * from "./wn-obj-title-types";
export { WnObjTitle, WnObjTitleInfo };
export * from "./support";
