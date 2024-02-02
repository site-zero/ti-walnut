import { I18n, TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnSky from "./WnSky.vue";

const COM_TYPE = "WnSky";

const WnSkyInfo: TiComInfo = {
  icon: "fas-compass",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wn-sky-com-name",
  i18n: I18n.createEmptyI18nSet(),
  exampleProps: [],
  com: WnSky,
  install: (app: App) => {
    app.component(COM_TYPE, WnSky);
  }
};

export { WnSky, WnSkyInfo };
