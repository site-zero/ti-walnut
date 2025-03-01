import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnRdsBrowser from './WnRdsBrowser.vue';

const COM_TYPE = 'WnRdsBrowser';

const WnRdsBrowserInfo: TiComInfo = {
  race: TiComRace.VIEW,
  name: COM_TYPE,
  com: WnRdsBrowser,
  install: (app: App) => {
    app.component(COM_TYPE, WnRdsBrowser);
  },
};

export * from './rds-browser-types';
export { WnRdsBrowser, WnRdsBrowserInfo };
