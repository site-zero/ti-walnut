import { TiComSet } from '@site0/tijs';
import { WnArenaInfo } from './arena/wn-arena-index';
import { WnDirBrowserInfo } from './dir-browser/wn-dir-browser-index';
import { WnObjListInfo } from './obj-list/wn-obj-list-index';
import { WnObjTableInfo } from './obj-table/wn-obj-table-index';
import { WnObjMetaInfo } from './obj-meta/wn-obj-meta-index';
import { WnObjViewerInfo } from './obj-viewer/wn-obj-viewer-index';
import { WnSignInInfo } from './signin/wn-signin-index';
import { WnSkyInfo } from './sky/wn-sky-index';

export default {
  WnArena: WnArenaInfo,
  WnSky: WnSkyInfo,
  WnSignin: WnSignInInfo,
  WnObjViewer: WnObjViewerInfo,
  WnDirBrowser: WnDirBrowserInfo,
  WnObjList: WnObjListInfo,
  WnObjTable: WnObjTableInfo,
  WnObjMeta: WnObjMetaInfo,
} as TiComSet;

export { WnArena } from './arena/wn-arena-index';
export { WnDirBrowser } from './dir-browser/wn-dir-browser-index';
export { WnObjList } from './obj-list/wn-obj-list-index';
export { WnObjMeta } from './obj-meta/wn-obj-meta-index';
export { WnSignIn } from './signin/wn-signin-index';
export { WnSky } from './sky/wn-sky-index';
