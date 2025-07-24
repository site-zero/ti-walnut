import { TiComInfo, TiComRace } from '@site0/tijs';
import { App } from 'vue';
import i18n from './i18n';
import WnSignIn from './WnSignIn.vue';

const COM_TYPE = 'WnSignin';

const WnSignInInfo: TiComInfo = {
  icon: 'fas-compass',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: 'i18n:wn-signin-com-name',
  i18n,
  defaultProps: '---',
  exampleProps: [],
  com: WnSignIn,
  install: (app: App) => {
    app.component(COM_TYPE, WnSignIn);
  },
};

export { WnSignIn, WnSignInInfo };

