import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnObjTable from './WnObjTable.vue';

const COM_TYPE = 'WnObjTable';

const WnObjTableInfo: TiComInfo = {
  icon: 'fas-table-list',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  com: WnObjTable,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjTable);
  },
};

export * from './wn-obj-table-types';
export { WnObjTable, WnObjTableInfo };
