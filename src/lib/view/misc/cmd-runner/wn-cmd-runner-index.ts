import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import WnCmdRunner from './WnCmdRunner.vue';

const COM_TYPE = 'WnCmdRunner';

const WnCmdRunnerInfo: TiComInfo = {
  icon: 'fas-list',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  com: WnCmdRunner,
  install: (app: App) => {
    app.component(COM_TYPE, WnCmdRunner);
  },
};

export { WnCmdRunner, WnCmdRunnerInfo };
export * from './wn-cmd-runner-types';
