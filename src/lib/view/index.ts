import { TiComSet } from '@site0/tijs';
import { WnCmdRunnerInfo } from './cmd-runner/wn-cmd-runner-index';
import { WnDirBrowserInfo } from './dir-browser/wn-dir-browser-index';
import { WnHubArenaInfo } from './hub-arena/wn-hub-arena-index';
import { WnHubAvatarInfo } from './hub-avatar/wn-hub-avatar-index';
import { WnHubMenuInfo } from './hub-menu/wn-hub-menu-index';

import { WnHubFootInfo } from './hub-foot/wn-hub-foot-index';
import { WnHubSideNavInfo } from './hub-sidenav/wn-hub-side-nav-index';
import { WnHubSkyInfo } from './hub-sky/wn-hub-sky-index';

import { WnObjListInfo } from './obj-list/wn-obj-list-index';
import { WnObjMetaInfo } from './obj-meta/wn-obj-meta-index';
import { WnObjTableInfo } from './obj-table/wn-obj-table-index';
import { WnObjViewerInfo } from './obj-viewer/wn-obj-viewer-index';
import { WnRdsBrowserInfo } from './rds-browser/rds-browser-index';
import { WnSignInInfo } from './signin/wn-signin-index';

export default {
  // Hub
  WnHubArena: WnHubArenaInfo,
  WnHubAvatar: WnHubAvatarInfo,
  WnHubMenu: WnHubMenuInfo,
  WnHubFoot: WnHubFootInfo,
  WnHubSideNav: WnHubSideNavInfo,
  WnHubSky: WnHubSkyInfo,

  // Signup
  WnSignin: WnSignInInfo,

  // Viewer
  WnObjViewer: WnObjViewerInfo,
  WnDirBrowser: WnDirBrowserInfo,
  WnObjList: WnObjListInfo,
  WnObjTable: WnObjTableInfo,
  WnObjMeta: WnObjMetaInfo,
  WnCmdRunner: WnCmdRunnerInfo,
  WnRdsBrowser: WnRdsBrowserInfo,
} as TiComSet;

export * from './cmd-runner/wn-cmd-runner-index';
export * from './dir-browser/wn-dir-browser-index';
export * from './hub-arena/wn-hub-arena-index';
export * from './hub-avatar/wn-hub-avatar-index';
export * from './hub-foot/wn-hub-foot-index';
export * from './hub-menu/wn-hub-menu-index';
export * from './hub-sidenav/wn-hub-side-nav-index';
export * from './hub-sky/wn-hub-sky-index';
export * from './obj-list/wn-obj-list-index';
export * from './obj-meta/wn-obj-meta-index';
export * from './obj-table/wn-obj-table-index';
export * from './rds-browser/rds-browser-index';
export * from './signin/wn-signin-index';
