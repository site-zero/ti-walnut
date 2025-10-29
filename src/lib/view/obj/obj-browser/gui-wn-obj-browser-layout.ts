import { LayoutBlock, LayoutGridProps } from "@site0/tijs";
import { WnObjBrowserProps } from "./wn-obj-browser-types";
import { WnObjBrowserApi } from "./use-wn-obj-browser-api";

export function useWnObjBrowserLayout(
  _props: WnObjBrowserProps,
  _api: WnObjBrowserApi
): LayoutGridProps {
  return {
    className: "fit-parent as-card with-shadow r-s",
    keepSizes: "local: GUI-WnObjBrowser-Layout-Sizes",
    gridStyle: {
      backgroundColor: "var(--ti-color-body)",
    },
    layout: {
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "auto 1fr auto",
      gap: "var(--ti-gap-m)",
    },
    blocks: [
      {
        name: "head",
        grid: { gridColumn: "span 2" },
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
        grid: { gridColumn: "span 2" },
      },
    ],
  };
}
