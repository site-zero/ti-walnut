import { CommonProps, Vars } from "@site0/tijs";
import { WnObj } from "../../../../_types";
import { GalleryMode } from "../../obj-gallery/wn-obj-gallery-types";

export type WnObjBrowserSkyBarEmitter = {
  (event: "change:gallery-mode", payload: GalleryMode): void;
  (event: "change:show-detail", payload: boolean): void;
  (event: "reload"): void;
};

export type WnObjBrowserSkyBarProps = CommonProps & {
  objPath: WnObj[];
  objId?: string;
  /**
   * 动作菜单的上下文变量
   */
  menuVars?: Vars;
  /**
   * 对象展现模式，默认 ‘wall’
   */
  galleryMode?: GalleryMode;
  /**
   * 是否显示详细信息
   */
  showDetail?: boolean;
};
