import { WnObjUploaderProps } from "@site0/ti-walnut";
import { CommonProps, UploadBarProps } from "@site0/tijs";

export type WnObjUploadBarProps = CommonProps &
  Omit<UploadBarProps, "actions"> &
  WnObjUploaderProps & {};
