import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import i18n from './i18n';
import WnDirBrowser from './WnDirBrowser.vue'

const COM_TYPE = 'WnDirBrowser';

const WnDirBrowserInfo: TiComInfo = {
  icon: 'zmdi-shape',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: 'i18n:wn-obj-viewer-com-name',
  i18n,
  defaultProps: '---',
  exampleProps: [],
  com: WnDirBrowser,
  install: (app: App) => {
    app.component(COM_TYPE, WnDirBrowser);
  },
};

export { WnDirBrowser, WnDirBrowserInfo };
