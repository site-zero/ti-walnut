import { SelectEmitInfo, TableRowData, TableRowID } from "@site0/tijs";
import { WnObjWallItem } from "../obj-wall/wn-obj-wall-types";
import {
  GallerySelectEmitInfo,
  WnObjGalleryEmitter,
  WnObjGalleryProps,
} from "./wn-obj-gallery-types";

export type WnObjGalleryApi = ReturnType<typeof useWnObjGalleryApi>;

export function useWnObjGalleryApi(
  _props: WnObjGalleryProps,
  emit: WnObjGalleryEmitter
) {
  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  //-----------------------------------------------------
  // 响应函数
  //-----------------------------------------------------
  function onSelect(info: SelectEmitInfo<TableRowID>) {
    emit("select", info as GallerySelectEmitInfo);
  }
  //-----------------------------------------------------
  function onOpenWallItem(item: WnObjWallItem) {
    emit("open", {
      id: item.id,
      index: item.index,
      obj: item.obj,
    });
  }
  //-----------------------------------------------------
  function onOpenTableItem(item: TableRowData) {
    emit("open", {
      id: item.id as string,
      index: item.index,
      obj: item.rawData,
    });
  }
  //-----------------------------------------------------
  // 模式: Wall 的配置
  //-----------------------------------------------------
  //-----------------------------------------------------
  // 模式: Table 的配置
  //-----------------------------------------------------
  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    onSelect,
    onOpenWallItem,
    onOpenTableItem,
  };
}
