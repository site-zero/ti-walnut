import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnLazyProxy from './WnLazyProxy.vue';

const COM_TYPE = 'WnLazzyProxy';

const WnLazyProxyInfo: TiComInfo = {
  race: TiComRace.SHELF,
  name: COM_TYPE,
  com: WnLazyProxy,
  install: (app: App) => {
    app.component(COM_TYPE, WnLazyProxy);
  },
};

export * from './wn-lazy-proxy-types';
export { WnLazyProxy, WnLazyProxyInfo };
