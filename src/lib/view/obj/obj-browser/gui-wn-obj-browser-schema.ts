import { CrumbProps, LayoutSchema } from "@site0/tijs";
import { WnObjBrowserApi } from "./use-wn-obj-browser-api";
import { WnObjBrowserProps } from "./wn-obj-browser-types";
import { getWnObjIcon } from "../../../../core";

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
          suffixIcon: "zmdi-chevron-right"
        },
        getValue: "id",
        getIcon: (obj) => getWnObjIcon(obj, "fas-cube"),
        getText: (obj) => obj.title || obj.nm || obj.id,
      } as CrumbProps,
    },
  };
}
