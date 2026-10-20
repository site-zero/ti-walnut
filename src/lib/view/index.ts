import { TiComSet } from "@site0/tijs";

// Conflict
import { WnConflictViewInfo } from "./conflict/wn-conflict-view-index";

// Hub
import {
  WnHubAvatarInfo,
  WnHubFootInfo,
  WnHubSessionInfo,
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
  WnHubAvatar: WnHubAvatarInfo,
  WnHubFoot: WnHubFootInfo,
  WnHubSideNav: WnHubSideNavInfo,
  WnHubSky: WnHubSkyInfo,
  WnHubSession: WnHubSessionInfo,

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
export * from "./hub";

// Obj
export * from "./obj";

// RDS
export * from "./rds/rds-browser/rds-browser-index";

// Misc
export * from "./misc/cmd-runner/wn-cmd-runner-index";
export * from "./misc/signin/wn-signin-index";
