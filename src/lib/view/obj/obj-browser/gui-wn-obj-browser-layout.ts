import { CssGridItem, KeepInfo, LayoutGridProps } from "@site0/tijs";
import { WnObjBrowserApi } from "./use-wn-obj-browser-api";
import { WnObjBrowserProps } from "./wn-obj-browser-types";

export function useWnObjBrowserLayout(
  _props: WnObjBrowserProps,
  _api: WnObjBrowserApi
): LayoutGridProps {
  let keepSizes: KeepInfo = "local: GUI-WnObjBrowser-Layout-Sizes-NoDetail";
  let gridTemplateColumns = "1fr";
  let blockGrid: CssGridItem | undefined = undefined;
  if (_api.ShowDetail.value) {
    keepSizes += "-WithDetail";
    gridTemplateColumns = "1fr 1fr";
    blockGrid = { gridColumn: "span 2" };
  }

  return {
    className: "fit-parent as-card with-shadow r-s",
    keepSizes,
    gridStyle: {
      backgroundColor: "var(--ti-color-body)",
    },
    layout: {
      gridTemplateColumns,
      gridTemplateRows: "auto 1fr auto",
      gap: "var(--ti-gap-m)",
    },
    blocks: [
      {
        name: "head",
        grid: blockGrid,
      },
      {
        name: "list",
        overflowMode: "cover",
      },
      {
        name: "detail",
        overflowMode: "fit",
        bar: {
          mode: "column",
          adjustIndex: 1,
          position: "prev",
        },
      },
      {
        name: "foot",
        grid: blockGrid,
      },
    ],
  };
}
