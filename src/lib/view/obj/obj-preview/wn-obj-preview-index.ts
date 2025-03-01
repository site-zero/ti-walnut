import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnObjPreview from './WnObjPreview.vue';

const COM_TYPE = 'WnObjPreview';

const WnObjPreviewInfo: TiComInfo = {
  icon: 'fas-list',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  com: WnObjPreview,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjPreview);
  },
};

export { WnObjPreview, WnObjPreviewInfo };
export * from './wn-obj-preview-types';
