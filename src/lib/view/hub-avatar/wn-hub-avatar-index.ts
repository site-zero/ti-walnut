import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnHubAvatar from './WnHubAvatar.vue';

const en_us = {};
const zh_cn = {};

const COM_TYPE = 'WnHubAvatar';

const WnHubAvatarInfo: TiComInfo = {
  race: TiComRace.VIEW,
  name: COM_TYPE,
  i18n: {
    en_us: en_us,
    en_uk: en_us,
    zh_cn: zh_cn,
    zh_hk: zh_cn,
  },
  com: WnHubAvatar,
  install: (app: App) => {
    app.component(COM_TYPE, WnHubAvatar);
  },
};

export * from './wn-hub-avatar-types';
export { WnHubAvatar, WnHubAvatarInfo };
