import {
  WnObj,
  WnObjInput,
  WnObjInputType,
  WnUploadFileOptions,
} from "@site0/ti-walnut";
import { CommonProps, IconInput } from "@site0/tijs";

export type WnObjMultiUploadTailEmitter = {
  (event: "change", objs: WnObj[]): void;
  (event: "change", objs: string[]): void;
};

export type WnObjMultiUploadTailProps = CommonProps & {
  value?: WnObjInput[];
  valueType?: WnObjInputType;
  
  upload?: WnUploadFileOptions;
  placeholder?: string;
  uploadIcon?: IconInput;

  /**
   * 指定了上传的文件的挂载目录。
   * 处理 value 输入的时候，如果用户直接从数据表里查询的
   * 通常 objId 是不带两段式前缀的。
   * 
   * 因此指定了这个属性，控件会强制为输入的对象加入这个 ID 前缀
   */
  mountHome?: WnObjInput;
};
