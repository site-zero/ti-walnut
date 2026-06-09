import { TiComSet } from "@site0/tijs";
import { WnObjMultiUploadTailInfo } from "./obj-multi-upload-tile/wn-obj-multi-upload-tail-index";
import { WnObjUploadBarInfo } from "./obj-upload-bar/wn-obj-upload-bar-index";
import { WnObjUploadTileInfo } from "./obj-upload-tile/wn-obj-upload-tile-index";

export default {
  WnObjUploadBar: WnObjUploadBarInfo,
  WnObjUploadTile: WnObjUploadTileInfo,
  WnObjMultiUploadTail: WnObjMultiUploadTailInfo,
} as TiComSet;

export * from "./obj-multi-upload-tile/wn-obj-multi-upload-tail-index";
export * from "./obj-upload-bar/wn-obj-upload-bar-index";
export * from "./obj-upload-tile/wn-obj-upload-tile-index";
