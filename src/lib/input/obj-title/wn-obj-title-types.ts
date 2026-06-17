import { CommonProps } from "@site0/tijs";
import { WnObj } from "@site0/ti-walnut";

export type WnObjTitleEmitter = {
  (event: "change", payload: string | null): void;
};

export type WnObjTitleProps = CommonProps & {
  /**
   * 标题文本
   */
  value?: string;

  /**
   * 对象完整的 Meta，尤其有用的是
   * - nm
   * - tp|mime|len|sha1
   * - local: {name,mime,size}
   * - width/height (如果是图片的话)
   */
  meta?: WnObj;
};
