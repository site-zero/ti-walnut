import { CommonProps, Vars } from '@site0/tijs';
import { WnUploadFileOptions } from '../../../core';

export type WnSliderEmitter = {
  (event: 'change', value: string | WnSlider): void;
};

export type WnSliderMedia = {
  /**
   * 一个唯一 ID 用来
   */
  id: string;
  /**
   * 分组类型
   */
  group?: string;

  /**
   * 媒体文件 ID
   * 可以通过 /api/media/{ID} 获取这个媒体的内容
   * 可以通过 /api/thumb/{ID} 获取这个媒体的缩略图
   */
  oid?: string;

  /**
   * 本项的标题，或者名称
   */
  title?: string;

  /**
   * 显示内容类型，通常不是图片就是视频
   */
  mime?: string;

  /**
   * 点击的跳转链接
   */
  href?: string;
};

export type WnSlider = {
  medias?: WnSliderMedia[];

  /**
   * 轮播图切换间隔 (秒)
   * 0 表示不自动轮播
   */
  interval: number;

  /**
   *  自动将媒体按照 group 进行分组展示
   */
  autoGroup?: boolean;
};

export type WnSliderEditorProps = CommonProps & {
  /**
   * 输入的值
   */
  value?: string | WnSlider;

  /**
   * 对应主页的 JSON 文件的 ID
   */
  meta?: Vars;

  /**
   * 输出的值类型
   *
   * - `obj`  : 维持对象 `WnSlider` 的结构
   * - `json` : 将对象转换为 JSON 字符串
   * - `json5`: 将对象转换为 JSON5 字符串
   */
  valueType?: 'obj' | 'json' | 'json5';

  /**
   * 仅仅 `valueType=='str'` 的时候有效
   *
   * - `0`: 不格式化
   * - `2`: 格式化，采用 2 个空格缩进
   * - `3`: 格式化，采用 3 个空格缩进
   * - `4`: 格式化，采用 4 个空格缩进
   *
   * @default 2
   */
  formatJsonIndent?: number;

  /**
   * 上传设定
   */
  upload: WnUploadFileOptions;
};
