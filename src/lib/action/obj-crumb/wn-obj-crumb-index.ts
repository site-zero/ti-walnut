import { App } from "vue";
import { TiComInfo, TiComRace } from "@site0/tijs";
import WnObjCrumb from "./WnObjCrumb.vue";

const COM_TYPE = "WnObjCrumb";

/**
 * 将对象列表渲染为面包屑导航条
 */
const WnObjCrumbInfo: TiComInfo = {
  race: TiComRace.TILE,
  name: COM_TYPE,
  com: WnObjCrumb,
  install: (app: App) => {
    app.component(COM_TYPE, WnObjCrumb);
  },
};

export { WnObjCrumb, WnObjCrumbInfo };
export * from "./wn-obj-crumb-types";
