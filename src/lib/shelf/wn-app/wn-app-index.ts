import { I18n, TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnApp from "./WnApp.vue";

const COM_TYPE = "WnApp";

const WnAppInfo: TiComInfo = {
  icon: "fas-rocket",
  race: TiComRace.SHELF,
  name: COM_TYPE,
  text: "i18n:wn-arena-com-name",
  i18n: I18n.createEmptyI18nSet(),
  exampleProps: [],
  com: WnApp,
  install: (app: App) => {
    app.component(COM_TYPE, WnApp);
  }
};

export { WnApp, WnAppInfo };
