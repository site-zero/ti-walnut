import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnObjMeta from './WnObjMeta.vue';

const COM_TYPE = 'WnObjMeta';

const WnObjMetaInfo: TiComInfo = {
  icon: 'fas-list',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  com: WnObjMeta,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjMeta);
  },
};

export { WnObjMeta, WnObjMetaInfo };
export * from './wn-obj-meta-types';
