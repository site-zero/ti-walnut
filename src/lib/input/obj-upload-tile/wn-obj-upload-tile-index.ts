import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnObjUploadTile from './WnObjUploadTile.vue';

const COM_TYPE = 'WnObjUploadTile';

const en_us = {
  'com-name': 'Object Upload Tile',
};
const zh_cn = {
  'com-name': '对象上传瓦片',
};

const WnObjUploadTileInfo: TiComInfo = {
  race: TiComRace.INPUT,
  name: COM_TYPE,
  text: 'i18n:wn-obj-upload-tile-com-name',
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnObjUploadTile,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjUploadTile);
  },
};

export * from './wn-obj-upload-tile-types';
export { WnObjUploadTile, WnObjUploadTileInfo };
