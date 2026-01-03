import { TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnObjGallery from "./WnObjGallery.vue";

const COM_TYPE = "WnObjGallery";

const en_us = {
  'com-name': 'WnObjGallery',
};
const zh_cn = {
  'com-name': 'WnObjGallery',
};

const WnObjGalleryInfo: TiComInfo = {
  icon: "fas-address-book",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wn-obj-gallery-com-name",
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnObjGallery,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjGalleryInfo);
  },
  defaultProps: "",
  exampleProps: [],
};

export * from "./wn-obj-gallery-types";
export { WnObjGallery, WnObjGalleryInfo };