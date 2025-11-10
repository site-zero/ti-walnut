import { CommonProps } from "@site0/tijs";
import { WnObj } from "../../../../_types";

export type WnObjBrowserEmitter = {
  (event: "change", payload: any): void;
};

export type WnObjBrowserLoadMode = "puppet" | "worker";

export type WnObjBrowserProps = CommonProps & {
  /**
   * 加载模式
   *
   * - puppet: 直接利用 objList/objPath 显示数据
   * - worker: 主动根据 homePath 加载数据
   * - auto: 自动判断，
   *    > 如果未指定 home 则为 puppet 模式
   *    > 否则为 worker 模式
   */
  loadMode?: WnObjBrowserLoadMode | "auto";

  /**
   * 主目录路径，在 puppet 模式下需要
   */
  homePath?: string;

  /**
   * 列表视图显示的对象数据
   */
  objList?: WnObj[];
  /**
   * 面包屑导航的数据
   */
  objPath?: WnObj[];
  /**
   * 指定面包屑高亮的对象
   */
  currentDirId?: string;
};
