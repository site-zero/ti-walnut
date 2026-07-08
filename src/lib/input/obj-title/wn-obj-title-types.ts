import { WnObj } from "@site0/ti-walnut";
import { ActionBarProps, CommonProps, IconProps } from "@site0/tijs";

export type WnObjTitleEmitter = {
  (event: "change", payload: string | null): void;
};

export type WnObjTitleProps = CommonProps & {
  /**
   * 标题文本
   */
  value?: string;

  /**
   * 对象完整的 Meta，尤其有用的是
   * - nm
   * - tp|mime|len|sha1
   * - local: {name,mime,size}
   * - width/height (如果是图片的话)
   */
  meta?: WnObj;

  /**
   * 自定义动作菜单，快捷命令为:
   *
   * - "EDIT" : 编辑标题
   */
  actionBar?: ActionBarProps;

  /**
   * 用户可以在对象图标前，再叠加一组提示图标
   */
  prefixIcons?: IconProps[];
};
