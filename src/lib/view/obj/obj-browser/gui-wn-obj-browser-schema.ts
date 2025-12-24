import { CrumbProps, LayoutSchema, PagerProps } from "@site0/tijs";
import { getWnObjIcon } from "../../../../core";
import { WnObjTableProps } from "../obj-table/wn-obj-table-types";
import { WnObjViewerProps } from "../obj-viewer/wn-obj-viewer-types";
import { WnObjBrowserApi } from "./use-wn-obj-browser-api";
import { WnObjBrowserProps } from "./wn-obj-browser-types";

export function useWnObjBrowserSchema(
  _props: WnObjBrowserProps,
  api: WnObjBrowserApi
): LayoutSchema {
  return {
    head: {
      comType: "TiCrumb",
      comConf: {
        data: api.ObjPath.value,
        value: api.CurrentDirId.value,
        style: {
          padding: "4px 4px 4px 8px",
        },
        head: {
          prefixIcon: "fas-desktop",
          suffixIcon: "zmdi-chevron-right",
        },
        getValue: "id",
        getIcon: (obj) => getWnObjIcon(obj, "fas-cube"),
        getText: (obj) => obj.title || obj.nm || obj.id,
      } as CrumbProps,
    },
    list: {
      comType: "WnObjTable",
      comConf: {
        data: api.ObjList.value,
        currentId: api.CurrentObjId.value,
        checkedIds: api.CheckedObjIds.value,
      } as WnObjTableProps,
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
        data: api.CurrentObj.value,
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
