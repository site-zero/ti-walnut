import { TiComSet } from "@site0/tijs";

// Conflict
import { WnConflictViewInfo } from "./conflict/wn-conflict-view-index";

// Hub
import {
  WnHubArenaInfo,
  WnHubAvatarInfo,
  WnHubFootInfo,
  WnHubMenuInfo,
  WnHubSideNavInfo,
  WnHubSkyInfo,
} from "./hub/";

// Obj
import {
  WnObjBrowserInfo,
  WnObjBrowserSkyBarInfo,
  WnObjGalleryInfo,
  WnObjListInfo,
  WnObjMetaInfo,
  WnObjPreviewInfo,
  WnObjTableInfo,
  WnObjViewerInfo,
  WnObjWallInfo,
} from "./obj";

// RDS
import { WnRdsBrowserInfo } from "./rds/rds-browser/rds-browser-index";

// Misc
import { WnCmdRunnerInfo, WnSignInInfo } from "./misc";

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
  WnObjBrowserSkyBar: WnObjBrowserSkyBarInfo,
  WnObjViewer: WnObjViewerInfo,
  WnObjList: WnObjListInfo,
  WnObjTable: WnObjTableInfo,
  WnObjWall: WnObjWallInfo,
  WnObjMeta: WnObjMetaInfo,
  WnObjPreview: WnObjPreviewInfo,
  WnObjGallery: WnObjGalleryInfo,

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
export * from "./obj";

// RDS
export * from "./rds/rds-browser/rds-browser-index";

// Misc
export * from "./misc/cmd-runner/wn-cmd-runner-index";
export * from "./misc/signin/wn-signin-index";
