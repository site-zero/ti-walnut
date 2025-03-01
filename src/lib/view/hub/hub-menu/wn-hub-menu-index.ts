import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnHubMenu from './WnHubMenu.vue';

const en_us = {};
const zh_cn = {};

const COM_TYPE = 'WnHubMenu';

const WnHubMenuInfo: TiComInfo = {
  race: TiComRace.VIEW,
  name: COM_TYPE,
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnHubMenu,
  install: (app: App) => {
    app.component(COM_TYPE, WnHubMenu);
  },
};

export * from './wn-hub-menu-types';
export { WnHubMenu, WnHubMenuInfo };
