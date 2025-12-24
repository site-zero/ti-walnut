import {
  AspectSize,
  CommonProps,
  CssObjectFit,
  GridLayoutHint,
  Vars,
  WallProps,
} from "@site0/tijs";
import { WnObj } from "../../../_types";

export type WnObjWallEmitter = {
  (event: "change", payload: any): void;
};

export type WnObjWallProps = CommonProps &
  Omit<WallProps, "data"> & {
    data?: WnObj[];

    //-------------------------------------
    // Aspect
    //-------------------------------------
    /**
     * 如何布局格子的水平轨道，默认 '<120>'
     */
    layoutHint?: GridLayoutHint;

    /**
     * 缩率图，如果是字体图标，那么字体的自定义大小
     */
    thumbFontSize?: AspectSize;

    /**
     * 缩略图，如果是图片，那么 `<div><img></div>` 包裹器的Padding
     */
    thumbImageWrapperPadding?: AspectSize;

    /**
     * 缩略图，如果是图片，那么 `<img>` 元素的 border-radis
     */
    thumbImageRadius?: AspectSize;
    thumbImageObjFit?: CssObjectFit;

    //-------------------------------------
    // 自定义样式
    //-------------------------------------

    /**
     * * 缩率图，如果是字体图标，那么 `<i>` 的自定义样式
     */
    thumbFontStyle?: Vars;

    /**
     * 缩略图，如果是图片，那么 `<div><img></div>` 包裹器的自定义样式
     */
    thumbImageWrapperStyle?: Vars;

    /**
     * 缩略图，如果是图片，那么 `<img>` 的自定义样式
     */
    thumbImageEleStyle?: Vars;
  };
