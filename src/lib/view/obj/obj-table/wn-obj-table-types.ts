import {
  WnObj,
  WnUploadFileNameRender,
  WnUploadFileOptions,
} from "@site0/ti-walnut";
import {
  ColumnRefer,
  KeepInfo,
  RoadblockProps,
  TableEmitter,
} from "@site0/tijs";

export type WnObjTableEmitter = TableEmitter & {
  (event: "upload:done", objs: WnObj[]): void;
};

export type WnObjTableProps = {
  keepColumns?: KeepInfo;
  columns?: ColumnRefer[];
  data?: WnObj[];
  currentId?: string;
  checkedIds?: string[];
  upload?: WnUploadFileOptions;
  emptyRoadblock?: RoadblockProps;
  /**
   * 开启这个选项，将支持从剪贴板复制截图
   *
   * 文件名格式这里指定，譬如 `screenshot-${now}`
   *
   */
  screenshotName?: string | WnUploadFileNameRender;
  /**
   * 指定一个全局 Bus 的键，监听这个事件用来触发 upload
   */
  busUploadKey?: string;
  /**
   * 指定一个全局 Bus 的键，监听这个事件用来触发 paste to upload screenshot
   */
  busScreenshotKey?: string;
};
