import { LayoutSchema, PagerProps } from "@site0/tijs";
import { WnObjBrowserSkyBarProps, WnObjGalleryProps } from "../../..";
import { WnObjViewerProps } from "../obj-viewer/wn-obj-viewer-types";
import { WnObjBrowserApi } from "./use-wn-obj-browser-api";
import { WnObjBrowserProps } from "./wn-obj-browser-types";

export function useWnObjBrowserSchema(
  _props: WnObjBrowserProps,
  api: WnObjBrowserApi
): LayoutSchema {
  return {
    head: {
      comType: "WnObjBrowserSkyBar",
      comConf: {
        menuVars: api.MenuVars.value,
        objPath: api.ObjPath.value,
        objId: api.CurrentDirId.value,
        galleryMode: api.ViewGalleryMode.value,
        showDetail: api.ShowDetail.value,
      } as WnObjBrowserSkyBarProps,
      events: {
        "change:gallery-mode": ({ data: galleryMode }) => {
          api.setGalleryMode(galleryMode);
        },
        "change:show-detail": ({ data: showDetail }) => {
          api.setShowDetail(showDetail);
        },
        "reload": async () => {
          await api.reload();
        },
      },
    },
    list: {
      //comType: "WnObjTable",
      comType: "WnObjGallery",
      comConf: {
        mode: api.ViewGalleryMode.value,
        data: api.ObjList.value,
        currentId: api.CurrentObjId.value,
        checkedIds: api.CheckedObjIds.value,
        upload: api.UploadConfig.value,
      } as WnObjGalleryProps,
      events: {
        select: ({ data }) => {
          console.log(data);
          api.onSelect(data);
        },
      },
    },
    detail: {
      comType: "WnObjViewer",
      comConf: {
        meta: api.CurrentObj.value,
        tabs: ["preview", "meta"],
      } as WnObjViewerProps,
    },
    foot: {
      comType: "TiPager",
      comConf: {
        mode: "jumper",
        pageNumber: api.Pager.value.pageNumber,
        pageSize: api.Pager.value.pageSize,
        pageCount: api.Pager.value.pageCount,
        totalCount: api.Pager.value.totalCount,
        count: api.Pager.value.count,
      } as PagerProps,
    },
  };
}
