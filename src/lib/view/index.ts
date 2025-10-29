import { TiComSet } from "@site0/tijs";

// Conflict
import { WnConflictViewInfo } from "./conflict/wn-conflict-view-index";

// Hub
import { WnHubArenaInfo } from "./hub/hub-arena/wn-hub-arena-index";
import { WnHubAvatarInfo } from "./hub/hub-avatar/wn-hub-avatar-index";
import { WnHubFootInfo } from "./hub/hub-foot/wn-hub-foot-index";
import { WnHubMenuInfo } from "./hub/hub-menu/wn-hub-menu-index";
import { WnHubSideNavInfo } from "./hub/hub-sidenav/wn-hub-side-nav-index";
import { WnHubSkyInfo } from "./hub/hub-sky/wn-hub-sky-index";

// Obj
import {
  WnObjBrowserInfo,
  WnObjListInfo,
  WnObjMetaInfo,
  WnObjPreviewInfo,
  WnObjTableInfo,
  WnObjViewerInfo,
} from "./obj";

// RDS
import { WnRdsBrowserInfo } from "./rds/rds-browser/rds-browser-index";

// Misc
import { WnCmdRunnerInfo } from "./misc/cmd-runner/wn-cmd-runner-index";
import { WnSignInInfo } from "./misc/signin/wn-signin-index";

export default {
  // Conflict
  WnConflictView: WnConflictViewInfo,

  // Hub
  WnHubArena: WnHubArenaInfo,
  WnHubAvatar: WnHubAvatarInfo,
  WnHubMenu: WnHubMenuInfo,
  WnHubFoot: WnHubFootInfo,
  WnHubSideNav: WnHubSideNavInfo,
  WnHubSky: WnHubSkyInfo,

  // Obj
  WnObjBrowser: WnObjBrowserInfo,
  WnObjViewer: WnObjViewerInfo,
  WnObjList: WnObjListInfo,
  WnObjTable: WnObjTableInfo,
  WnObjMeta: WnObjMetaInfo,
  WnObjPreview: WnObjPreviewInfo,
  

  // RDS
  WnRdsBrowser: WnRdsBrowserInfo,

  // Misc
  WnSignin: WnSignInInfo,
  WnCmdRunner: WnCmdRunnerInfo,
} as TiComSet;

// Conflict
export * from "./conflict/wn-conflict-view-index";

// Hub
export * from "./hub/hub-arena/wn-hub-arena-index";
export * from "./hub/hub-avatar/wn-hub-avatar-index";
export * from "./hub/hub-foot/wn-hub-foot-index";
export * from "./hub/hub-menu/wn-hub-menu-index";
export * from "./hub/hub-sidenav/wn-hub-side-nav-index";
export * from "./hub/hub-sky/wn-hub-sky-index";

// Obj
export * from "./obj/obj-list/wn-obj-list-index";
export * from "./obj/obj-meta/wn-obj-meta-index";
export * from "./obj/obj-preview/wn-obj-preview-index";
export * from "./obj/obj-table/wn-obj-table-index";
export * from "./obj/obj-viewer/wn-obj-viewer-index";

// RDS
export * from "./rds/rds-browser/rds-browser-index";

// Misc
export * from "./misc/cmd-runner/wn-cmd-runner-index";
export * from "./misc/signin/wn-signin-index";
