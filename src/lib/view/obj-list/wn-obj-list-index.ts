import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import i18n from './i18n';
import WnObjList from './WnObjList.vue';

const COM_TYPE = 'WnObjList';

const WnObjListInfo: TiComInfo = {
  icon: 'fas-list',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: 'i18n:wn-obj-list-com-name',
  i18n,
  defaultProps: '---',
  exampleProps: [],
  com: WnObjList,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjList);
  },
};

export { WnObjList, WnObjListInfo };
