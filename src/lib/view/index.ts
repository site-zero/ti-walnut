import { TiComSet } from '@site0/tijs';
import { WnArenaInfo } from './arena/wn-arena-index';
import { WnSkyInfo } from './sky/wn-sky-index';
import { WnSignInInfo } from './signin/wn-signin-index';
import { WnObjViewerInfo } from './obj-viewer/wn-obj-viewer-index';
import { WnDirBrowserInfo } from './dir-browser/wn-dir-browser-index';

export default {
  WnArena: WnArenaInfo,
  WnSky: WnSkyInfo,
  WnSignin: WnSignInInfo,
  WnObjViewer: WnObjViewerInfo,
  WnDirBrowser: WnDirBrowserInfo,
} as TiComSet;

export { WnArena } from './arena/wn-arena-index';
export { WnSky } from './sky/wn-sky-index';
export { WnSignIn } from './signin/wn-signin-index';
export { WnDirBrowser } from './dir-browser/wn-dir-browser-index';
