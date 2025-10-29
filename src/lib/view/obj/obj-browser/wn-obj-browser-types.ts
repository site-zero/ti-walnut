import { CommonProps } from "@site0/tijs";

export type WnObjBrowserEmitter = {
  (event: "change", payload: any): void;
};

export type WnObjBrowserProps = CommonProps & {
  // 这里放置控件支持的属性
};