import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnSliderEditor from './WnSliderEditor.vue';

const COM_TYPE = 'WnSliderEditor';

const en_us = {
  'com-name': 'Slider Editor',
};
const zh_cn = {
  'com-name': '轮播图编辑',
};

/**
 * 在表格里显示一个对象的图标或者缩略图
 */
const WnSliderEditorInfo: TiComInfo = {
  race: TiComRace.TILE,
  name: COM_TYPE,
  text: 'i18n:wn-slider-editor-com-name',
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnSliderEditor,
  install: (app: App) => {
    app.component(COM_TYPE, WnSliderEditor);
  },
};

export * from './wn-slider-editor-types';
export { WnSliderEditor, WnSliderEditorInfo };
