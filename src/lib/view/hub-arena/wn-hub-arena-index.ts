import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnHubArena from './WnHubArena.vue';

const en_us = {};
const zh_cn = {};

const COM_TYPE = 'WnHubArena';

const WnHubArenaInfo: TiComInfo = {
  race: TiComRace.VIEW,
  name: COM_TYPE,
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnHubArena,
  install: (app: App) => {
    app.component(COM_TYPE, WnHubArena);
  },
};

export * from './wn-hub-arena-types';
export { WnHubArena, WnHubArenaInfo };
