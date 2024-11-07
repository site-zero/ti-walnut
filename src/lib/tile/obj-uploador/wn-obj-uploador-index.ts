import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnObjUploador from './WnObjUploador.vue';

const COM_TYPE = 'WnObjUploador';

const WnObjUploadorInfo: TiComInfo = {
  race: TiComRace.TILE,
  name: COM_TYPE,
  com: WnObjUploador,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjUploador);
  },
};

export * from './wn-obj-uploador-types';
export { WnObjUploador, WnObjUploadorInfo };
