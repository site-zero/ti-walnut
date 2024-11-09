import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnObjUploadBar from './WnObjUploadBar.vue';

const COM_TYPE = 'WnObjUploadBar';

const en_us = {
  'com-name': 'Object Upload Bar',
  'placeholder': 'Choose file to upload',
};
const zh_cn = {
  'com-name': '对象上传条',
  'placeholder': '选择要上传的文件',
};

const WnObjUploadBarInfo: TiComInfo = {
  race: TiComRace.TILE,
  name: COM_TYPE,
  text: 'i18n:wn-obj-upload-bar-com-name',
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnObjUploadBar,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjUploadBar);
  },
};

export * from './wn-obj-upload-bar-types';
export { WnObjUploadBar, WnObjUploadBarInfo };
