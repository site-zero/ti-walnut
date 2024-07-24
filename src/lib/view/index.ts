import { TiComSet } from '@site0/tijs';
import { WnArenaInfo } from './arena/wn-arena-index';
import { WnCmdRunnerInfo } from './cmd-runner/wn-cmd-runner-index';
import { WnDirBrowserInfo } from './dir-browser/wn-dir-browser-index';
import { WnObjListInfo } from './obj-list/wn-obj-list-index';
import { WnObjMetaInfo } from './obj-meta/wn-obj-meta-index';
import { WnObjTableInfo } from './obj-table/wn-obj-table-index';
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
  WnCmdRunner: WnCmdRunnerInfo,
} as TiComSet;

export * from './arena/wn-arena-index';
export * from './cmd-runner/wn-cmd-runner-index';
export * from './dir-browser/wn-dir-browser-index';
export * from './obj-list/wn-obj-list-index';
export * from './obj-meta/wn-obj-meta-index';
export * from './signin/wn-signin-index';
export * from './sky/wn-sky-index';
