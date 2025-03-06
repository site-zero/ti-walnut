import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnHubFoot from './WnHubFoot.vue';

const en_us = {
  selected: 'Selected',
};
const zh_cn = {
  selected: '已选',
};

const COM_TYPE = 'WnHubFoot';

const WnHubFootInfo: TiComInfo = {
  race: TiComRace.VIEW,
  name: COM_TYPE,
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnHubFoot,
  install: (app: App) => {
    app.component(COM_TYPE, WnHubFoot);
  },
};

export * from './wn-hub-foot-types';
export { WnHubFoot, WnHubFootInfo };
