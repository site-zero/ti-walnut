import { ActionBarItem, SwitcherProps } from "@site0/tijs";
import {
  WnObjBrowserSkyBarEmitter,
  WnObjBrowserSkyBarProps,
} from "./wob-skybar-types";

export function useSkyBarActions(
  props: WnObjBrowserSkyBarProps,
  emit: WnObjBrowserSkyBarEmitter
) {
  //-----------------------------------------------------
  function forGalleryMode(): ActionBarItem {
    return {
      comType: "TiSwitcher",
      comConf: {
        value: props.galleryMode ?? "wall",
        options: [
          { value: "wall", icon: "zmdi-view-module" },
          //{ value: "wall", icon: "zmdi-view-dashboard" },
          //{ value: "table", icon: "fas-bars" },
          { value: "table", icon: "zmdi-view-headline" },
        ],
        nowrap: true,
        defaultItemType: "primary",
        itemGap: "t",
        itemSize: "m",
        itemStyle: {
          padding: "0",
          width: "var(--ti-measure-box-icon)",
          height: "var(--ti-measure-box-icon)",
          fontSize: "18px",
        },
      } as SwitcherProps,
      action: (mode) => {
        emit("change:gallery-mode", mode);
      },
    };
  }
  //-----------------------------------------------------
  function forRefresh(): ActionBarItem {
    return {
      icon: "zmdi-refresh",
      tip: "i18n:refresh",
      altDisplay: {
        test: { loading: true },
        icon: "zmdi-refresh zmdi-hc-spin",
        tip: "i18n:loading",
      },
      action: () => {
        emit("reload");
      },
    };
  }
  //-----------------------------------------------------
  function forToggleDetail(): ActionBarItem {
    return {
      icon: "far-eye",
      tip: "Show Detail",
      altDisplay: {
        test: { showDetail: true },
        icon: "far-eye-slash",
      },
      action: () => {
        const v = props.showDetail ? false : true;
        emit("change:show-detail", v);
      },
    };
  }
  //-----------------------------------------------------
  return {
    forGalleryMode,
    forRefresh,
    forToggleDetail,
  };
}
