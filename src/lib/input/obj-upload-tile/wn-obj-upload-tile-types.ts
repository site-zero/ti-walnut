import { WnObjUploaderProps } from "@site0/ti-walnut";
import { CommonProps, UploadTileProps } from "@site0/tijs";

export type WnObjUploadTileProps = CommonProps &
  Omit<UploadTileProps, "actions"> &
  WnObjUploaderProps & {};
