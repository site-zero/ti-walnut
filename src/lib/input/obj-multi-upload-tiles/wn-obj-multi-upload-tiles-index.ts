import { TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnObjMultiUploadTiles from "./WnObjMultiUploadTiles.vue";

const COM_TYPE = "WnObjMultiUploadTiles";

const en_us = {
  "com-name": "WnObjMultiUploadTiles",
  "placeholder": "Drag files here to upload",
};
const zh_cn = {
  "com-name": "WnObjMultiUploadTiles",
  "placeholder": "拖拽文件到此处上传",
};

const WnObjMultiUploadTilesInfo: TiComInfo = {
  icon: "fas-address-book",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wn-obj-multi-upload-tiles-com-name",
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnObjMultiUploadTiles,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjMultiUploadTilesInfo);
  },
  defaultProps: "",
  exampleProps: [],
};

export * from "./wn-omup-types";
export { WnObjMultiUploadTiles, WnObjMultiUploadTilesInfo };
