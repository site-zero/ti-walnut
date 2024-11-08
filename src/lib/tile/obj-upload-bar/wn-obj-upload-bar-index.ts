import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnObjUploadBar from './WnObjUploadBar.vue';

const COM_TYPE = 'WnObjUploadBar';

const WnObjUploadBarInfo: TiComInfo = {
  race: TiComRace.TILE,
  name: COM_TYPE,
  com: WnObjUploadBar,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjUploadBar);
  },
};

export * from './wn-obj-upload-bar-types';
export { WnObjUploadBar, WnObjUploadBarInfo };
