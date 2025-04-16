import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnObjMeta from './WnObjMeta.vue';

const COM_TYPE = 'WnObjMeta';

const en_us = {
  'com-name': 'Walnut Object Meta',
  'fgt-general': 'General',
  'fgt-file': 'File About',
  'fgt-timestamp': 'Timestamp',
  'fgt-permission': 'Permission',
};
const zh_cn = {
  'com-name': '对象元数据',
  'fgt-general': '基本信息',
  'fgt-file': '文件信息',
  'fgt-timestamp': '时间戳',
  'fgt-permission': '权限信息',
};

const WnObjMetaInfo: TiComInfo = {
  icon: 'fas-list',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: 'i18n:wn-obj-meta-com-name',
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnObjMeta,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjMeta);
  },
};

export * from './wn-obj-meta-types';
export { WnObjMeta, WnObjMetaInfo };
