import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnObjList from './WnObjList.vue';

const COM_TYPE = 'WnObjList';

const WnObjListInfo: TiComInfo = {
  icon: 'fas-list',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  com: WnObjList,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjList);
  },
};

export { WnObjList, WnObjListInfo };
export * from './wn-obj-list-types';
