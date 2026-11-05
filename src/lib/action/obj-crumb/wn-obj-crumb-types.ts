import { CommonProps, IconInput, TableRowID } from "@site0/tijs";
import { WnObj } from "../../../_types";

export type WnObjCrumbEmitter = {
  (event: "change", payload: WnObj): void;
};

export type WnObjCrumbProps = CommonProps & {
  /**
   * 对象列表，按顺序渲染为面包屑
   */
  data?: WnObj[];
};

/**
 * 由 WnObj 构建的面包屑项，可直接作为 TiCrumb 的 data 传入
 */
export type WnObjCrumbItem = {
  value: TableRowID;
  icon: IconInput;
  text: string;
};
