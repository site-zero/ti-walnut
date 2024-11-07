import { App } from 'vue';
import { TiComInfo, TiComRace } from '@site0/tijs';
import WnObjThumb from './WnObjThumb.vue';

const COM_TYPE = 'WnObjThumb';

/**
 * 在表格里显示一个对象的图标或者缩略图
 */
const WnObjThumbInfo: TiComInfo = {
  race: TiComRace.TILE,
  name: COM_TYPE,
  com: WnObjThumb,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjThumb);
  },
};

export { WnObjThumb, WnObjThumbInfo };
export * from './wn-obj-thumb-types';
