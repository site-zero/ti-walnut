import { WnObj, WnUploadFileOptions } from "@site0/ti-walnut";
import { CommonProps, IconInput } from "@site0/tijs";

export type WnObjMultiUploadTailEmitter = {
  (event: "change", objs: WnObj[]): void;
};

export type WnObjMultiUploadTailProps = CommonProps & {
  upload?: WnUploadFileOptions;
  placeholder?: string;
  uploadIcon?: IconInput;
};
