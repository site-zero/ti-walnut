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
  'dt-utc-ams': 'In MS',
  'obj-mime': 'MIME',
  'obj-tp': 'Type',
  'obj-sha1': 'SHA1',
  'obj-len': 'Size',
  'obj-md-val': 'Decimal',
  'obj-md-oct': 'Octal',
  'obj-md-mod': 'Code',
  'obj-md-owner': 'Owner',
  'obj-md-group': 'Group',
  'obj-md-other': 'Other',
};
const zh_cn = {
  'selected': '已选',
  'dt-utc-display': '显示值',
  'dt-utc-db': '数据值',
  'dt-utc-utc': 'UTC',
  'dt-utc-local': '本地',
  'dt-utc-tz': '会话时区',
  'dt-utc-browser': '浏览器',
  'dt-utc-ams': '绝对毫秒',
  'obj-mime': '内容类型',
  'obj-tp': '对象类型',
  'obj-sha1': 'SHA1',
  'obj-len': '文件大小',
  'obj-md-val': '十进制',
  'obj-md-oct': '八进制',
  'obj-md-mod': '码值',
  'obj-md-owner': '所有者',
  'obj-md-group': '群组',
  'obj-md-other': '其他',
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
