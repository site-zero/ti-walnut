import { TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnSetupTheme from "./WnSetupTheme.vue";

const COM_TYPE = "WnSetupTheme";

const WnSetupThemeInfo: TiComInfo = {
  icon: "fas-palette",
  race: TiComRace.EDIT,
  name: COM_TYPE,
  text: COM_TYPE,
  i18n: {
    en_uk: {},
    en_us: {},
    zh_cn: {},
    zh_hk: {},
  },
  com: WnSetupTheme,
  install: (app: App) => {
    app.component(COM_TYPE, WnSetupThemeInfo);
  },
  defaultProps: "",
  exampleProps: [],
};

export * from "./wn-setup-theme-types";
export { WnSetupTheme, WnSetupThemeInfo };