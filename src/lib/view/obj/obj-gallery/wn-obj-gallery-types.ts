import { CommonProps, RoadblockProps, SelectEmitInfo } from "@site0/tijs";
import { WnObjWallProps } from "../../..";
import { WnObj } from "../../../../_types";
import { WnUploadFileOptions } from "../../../../core";

export type GallerySelectEmitInfo = SelectEmitInfo<string>;
export type GalleryItem = {
  id: string;
  index: number;
  rawData: WnObj;
};

export type WnObjGalleryEmitter = {
  (event: "change", payload: any): void;
  (event: "upload:done", objs: WnObj[]): void;
  (event: "select", payload: GallerySelectEmitInfo): void;
  (event: "open", payload: GalleryItem): void;
};

export type GalleryMode = "wall" | "table";

type _ignore_keys = "data" | "currentId" | "checkedIds" | "emptyRoadblock";

export type WnObjGalleryProps = CommonProps & {
  //-----------------------------------------------------
  // 显示模式
  //-----------------------------------------------------
  /**
   * 默认为 `wall`
   */
  mode?: GalleryMode;

  //-----------------------------------------------------
  // 所有子控件都有的属性
  //-----------------------------------------------------
  data?: WnObj[];
  currentId?: string;
  checkedIds?: string[];

  /**
   * 没有数据时，显示的占位信息
   * 默认为 `{text:'暂无数据', icon:'icon-empty'}`
   */
  emptyRoadblock?: RoadblockProps;

  //-----------------------------------------------------
  // 开启拖拽上传功能
  //-----------------------------------------------------
  /**
   * 如果设置，表示支持拖拽上传功能
   */
  upload?: WnUploadFileOptions;
  /**
   * 指定一个全局 Bus 的键，监听这个事件用来触发 upload
   */
  busUploadKey?: string;

  //-----------------------------------------------------
  // 不同模式的配置
  //-----------------------------------------------------
  wall?: Omit<WnObjWallProps, _ignore_keys>;
  table?: Omit<WnObjWallProps, _ignore_keys>;
};
