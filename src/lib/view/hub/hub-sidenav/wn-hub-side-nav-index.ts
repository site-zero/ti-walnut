import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnHubSideNav from './WnHubSideNav.vue';

const en_us = {};
const zh_cn = {};

const COM_TYPE = 'WnHubSideNav';

const WnHubSideNavInfo: TiComInfo = {
  race: TiComRace.VIEW,
  name: COM_TYPE,
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnHubSideNav,
  install: (app: App) => {
    app.component(COM_TYPE, WnHubSideNav);
  },
};

export * from './wn-hub-side-nav-types';
export { WnHubSideNav, WnHubSideNavInfo };
