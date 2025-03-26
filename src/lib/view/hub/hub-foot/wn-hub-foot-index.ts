import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnHubFoot from './WnHubFoot.vue';

const en_us = {
  'selected': 'Selected',
  'dt-utc-display': 'Display',
  'dt-utc-db': 'Raw Date',
  'dt-utc-utc': 'UTC',
  'dt-utc-local': 'Local',
  'dt-utc-tz': 'TimeZone',
  'dt-utc-browser': 'Browser',
};
const zh_cn = {
  'selected': '已选',
  'dt-utc-display': '显示值',
  'dt-utc-db': '数据值',
  'dt-utc-utc': 'UTC',
  'dt-utc-local': '本地',
  'dt-utc-tz': '会话时区',
  'dt-utc-browser': '浏览器',
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
