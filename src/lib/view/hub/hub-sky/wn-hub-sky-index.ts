import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnHubSky from './WnHubSky.vue';

const en_us = {};
const zh_cn = {};

const COM_TYPE = 'WnHubSky';

const WnHubSkyInfo: TiComInfo = {
  race: TiComRace.VIEW,
  name: COM_TYPE,
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnHubSky,
  install: (app: App) => {
    app.component(COM_TYPE, WnHubSky);
  },
};

export * from './wn-hub-sky-types';
export { WnHubSky, WnHubSkyInfo };
