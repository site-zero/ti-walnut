import { TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnObjMultiUploadTail from "./WnObjMultiUploadTail.vue";

const COM_TYPE = "WnObjMultiUploadTail";

const en_us = {
  "com-name": "WnObjMultiUploadTail",
  "placeholder": "Drop to upload",
};
const zh_cn = {
  "com-name": "WnObjMultiUploadTail",
  "placeholder": "拖拽上传",
};

const WnObjMultiUploadTailInfo: TiComInfo = {
  icon: "fas-address-book",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wn-obj-multi-upload-tail-com-name",
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnObjMultiUploadTail,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjMultiUploadTailInfo);
  },
  defaultProps: "",
  exampleProps: [],
};

export * from "./wn-omup-types";
export { WnObjMultiUploadTail, WnObjMultiUploadTailInfo };
