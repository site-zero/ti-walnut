import {
  SelectEmitInfo,
  TableRowData,
  TableRowID,
  WallItem,
} from "@site0/tijs";
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
  function onOpenWallItem(item: WallItem) {
    emit("open", {
      id: item.id as string,
      index: item.index,
      rawData: item.rawData,
    });
  }
  //-----------------------------------------------------
  function onOpenTableItem(item: TableRowData) {
    emit("open", {
      id: item.id as string,
      index: item.index,
      rawData: item.rawData,
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
