import { TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnObjWall from "./WnObjWall.vue";

const COM_TYPE = "WnObjWall";

const en_us = {
  'com-name': 'WnObjWall',
};
const zh_cn = {
  'com-name': 'WnObjWall',
};

const WnObjWallInfo: TiComInfo = {
  icon: "fas-address-book",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wn-obj-wall-com-name",
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnObjWall,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjWallInfo);
  },
  defaultProps: "",
  exampleProps: [],
};

export * from "./wn-obj-wall-types";
export { WnObjWall, WnObjWallInfo };