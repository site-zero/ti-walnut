import { ActionBarProps } from "@site0/tijs";
import { WnObjBrowserProps } from "./wn-obj-browser-types";
import { WnObjBrowserApi } from "./use-wn-obj-browser-api";

export function useWnObjBrowserActions(
  _props: WnObjBrowserProps,
  _api: WnObjBrowserApi
): ActionBarProps {
  return {
    items: [
      {
        icon: "zmdi-refresh",
        text: "i18n:refresh",
        altDisplay: {
          test: { reloading: true },
          icon: "zmdi-refresh zmdi-hc-spin",
          text: "i18n:loading",
        },
        action: "refresh",
      }
    ],
  };
}