import { TiComInfo, TiComRace } from "@site0/tijs";
import { App } from "vue";
import WnConflictView from "./WnConflictView.vue";

const COM_TYPE = "WnConflictView";

const WnConflictViewInfo: TiComInfo = {
  icon: "fas-exclamation-triangle",
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: COM_TYPE,
  i18n: {
    en_uk: {},
    en_us: {},
    zh_cn: {},
    zh_hk: {},
  },
  com: WnConflictView,
  install: (app: App) => {
    app.component(COM_TYPE, WnConflictViewInfo);
  },
  defaultProps: "",
  exampleProps: [],
};

export * from "./wn-conflict-view-types";
export { WnConflictView, WnConflictViewInfo };
