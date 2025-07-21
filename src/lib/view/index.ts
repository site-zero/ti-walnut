import { TiComSet } from '@site0/tijs';
//Hub
import { WnHubArenaInfo } from './hub/hub-arena/wn-hub-arena-index';
import { WnHubAvatarInfo } from './hub/hub-avatar/wn-hub-avatar-index';
import { WnHubMenuInfo } from './hub/hub-menu/wn-hub-menu-index';
import { WnHubFootInfo } from './hub/hub-foot/wn-hub-foot-index';
import { WnHubSideNavInfo } from './hub/hub-sidenav/wn-hub-side-nav-index';
import { WnHubSkyInfo } from './hub/hub-sky/wn-hub-sky-index';

// Obj
import { WnObjListInfo } from './obj/obj-list/wn-obj-list-index';
import { WnObjMetaInfo } from './obj/obj-meta/wn-obj-meta-index';
import { WnObjTableInfo } from './obj/obj-table/wn-obj-table-index';
import { WnObjViewerInfo } from './obj/obj-viewer/wn-obj-viewer-index';
import { WnObjPreviewInfo } from './obj/obj-preview/wn-obj-preview-index';

// RDS
import { WnRdsBrowserInfo } from './rds/rds-browser/rds-browser-index';

// Misc
import { WnCmdRunnerInfo } from './misc/cmd-runner/wn-cmd-runner-index';
import { WnSignInInfo } from './misc/signin/wn-signin-index';

export default {
  // Hub
  WnHubArena: WnHubArenaInfo,
  WnHubAvatar: WnHubAvatarInfo,
  WnHubMenu: WnHubMenuInfo,
  WnHubFoot: WnHubFootInfo,
  WnHubSideNav: WnHubSideNavInfo,
  WnHubSky: WnHubSkyInfo,

  // Obj
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

//Hub
export * from './hub/hub-arena/wn-hub-arena-index';
export * from './hub/hub-avatar/wn-hub-avatar-index';
export * from './hub/hub-menu/wn-hub-menu-index';
export * from './hub/hub-foot/wn-hub-foot-index';
export * from './hub/hub-sidenav/wn-hub-side-nav-index';
export * from './hub/hub-sky/wn-hub-sky-index';

// Obj
export * from './obj/obj-list/wn-obj-list-index';
export * from './obj/obj-meta/wn-obj-meta-index';
export * from './obj/obj-table/wn-obj-table-index';
export * from './obj/obj-viewer/wn-obj-viewer-index';
export * from './obj/obj-preview/wn-obj-preview-index';

// RDS
export * from './rds/rds-browser/rds-browser-index';

// Misc
export * from './misc/cmd-runner/wn-cmd-runner-index';
export * from './misc/signin/wn-signin-index';
