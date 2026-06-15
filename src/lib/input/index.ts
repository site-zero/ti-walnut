import { TiComSet } from "@site0/tijs";
import { WnObjMultiUploadTilesInfo } from "./obj-multi-upload-tiles/wn-obj-multi-upload-tiles-index";
import { WnObjTitleInfo } from "./obj-title/wn-obj-title-index";
import { WnObjUploadBarInfo } from "./obj-upload-bar/wn-obj-upload-bar-index";
import { WnObjUploadTileInfo } from "./obj-upload-tile/wn-obj-upload-tile-index";

export default {
  WnObjUploadBar: WnObjUploadBarInfo,
  WnObjUploadTile: WnObjUploadTileInfo,
  WnObjMultiUploadTiles: WnObjMultiUploadTilesInfo,
  WnObjTitle: WnObjTitleInfo,
} as TiComSet;

export * from "./obj-multi-upload-tiles/wn-obj-multi-upload-tiles-index";
export * from "./obj-title/wn-obj-title-index";
export * from "./obj-upload-bar/wn-obj-upload-bar-index";
export * from "./obj-upload-tile/wn-obj-upload-tile-index";
