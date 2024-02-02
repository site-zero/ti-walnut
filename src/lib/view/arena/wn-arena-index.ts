import { I18n, TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnArena from "./WnArena.vue";

const COM_TYPE = "WnArena";

const WnArenaInfo: TiComInfo = {
  icon: "fas-street-view",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: "i18n:wn-arena-com-name",
  i18n: I18n.createEmptyI18nSet(),
  exampleProps: [],
  com: WnArena,
  install: (app: App) => {
    app.component(COM_TYPE, WnArena);
  }
};

export { WnArena, WnArenaInfo };
