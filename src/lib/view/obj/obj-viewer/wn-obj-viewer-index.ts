import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import i18n from './i18n';
import WnObjViewer from './WnObjViewer.vue';

const COM_TYPE = 'WnObjViewer';

const WnObjViewerInfo: TiComInfo = {
  icon: 'zmdi-shape',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: 'i18n:wn-obj-viewer-com-name',
  i18n,
  defaultProps: '---',
  exampleProps: [],
  com: WnObjViewer,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjViewer);
  },
};

export { WnObjViewer, WnObjViewerInfo };
