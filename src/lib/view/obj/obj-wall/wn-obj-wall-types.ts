import { WnObj } from "@site0/ti-walnut";
import {
  AspectSize,
  CommonProps,
  CssObjectFit,
  GridLayoutHint,
  ImageProps,
  ThumbAspect,
  Vars,
  WallProps,
} from "@site0/tijs";

export type WnObjWallSelectEmitInfo = {
  currentId?: string | null;
  checkedIds: string[];
  current?: WnObj;
  checked: WnObj[];
  index: number;
  oldCurrentId?: string | null;
  oldCheckedIds?: Map<string, boolean>;
};

export type WnObjWallItem = {
  id: string;
  index: number;
  obj: WnObj;
};

export type WnObjWallEmitter = {
  (event: "select", payload: WnObjWallSelectEmitInfo): void;
  (event: "open", payload: WnObjWallItem): void;
};

export type WnObjWallProps = CommonProps &
  Omit<WallProps, "data" | "wallItem"> & {
    data?: WnObj[];

    //-------------------------------------
    // Aspect
    //-------------------------------------
    /**
     * 如何布局格子的水平轨道，默认 '<120>'
     */
    layoutHint?: GridLayoutHint;

    preview?: Partial<Omit<ImageProps, "src" | "canDropFile">>;

    /**
     * 缩率图，如果是字体图标，那么字体的自定义大小
     */
    previewFontSize?: AspectSize;

    /**
     * 缩略图，如果是图片，那么 `<div><img></div>` 包裹器的Padding
     */
    previewImageWrapperPadding?: AspectSize;

    /**
     * 缩略图，如果是图片，那么 `<img>` 元素的 border-radis
     */
    previewImageRadius?: AspectSize;
    previewImageObjFit?: CssObjectFit;

    //-------------------------------------
    // 自定义样式
    //-------------------------------------
    /**
     * 缩略图，如果是字体图标，那么 `<i>` 的自定义样式
     */
    previewFontStyle?: Vars;

    /**
     * 缩略图，如果是图片，那么 `<div><img></div>` 包裹器的自定义样式
     */
    previewImageWrapperStyle?: Vars;

    /**
     * 缩略图，如果是图片，那么 `<img>` 的自定义样式
     */
    previewImageEleStyle?: Vars;

    /**
     * 更多的 Thumb 样式定义
     */
    thumbAspect?: ThumbAspect;
  };
