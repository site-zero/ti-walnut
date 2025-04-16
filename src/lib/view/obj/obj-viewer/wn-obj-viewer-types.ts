import {
  BlockProps,
  ColumnRefer,
  FieldRefer,
  LayoutPanelProps,
  RoadblockProps,
  TabsAspect,
  Vars,
} from '@site0/tijs';
import { WnUploadFileOptions } from '../../../../core';

export type WnObjViewerEmitter = {
  (event: 'show-content', contentIsShown: boolean): void;
  (event: 'meta-change', delta: Vars): void;
  (event: 'content-change', content: string): void;
};

export type WnObjViewerBlocks = {
  meta: BlockProps;
  preview: BlockProps;
  content: BlockProps;
};

export type WnObjViewerBlockName = keyof WnObjViewerBlocks;

export type WnObjViewerProps = TabsAspect & {
  meta?: Vars;

  // 对于 DIR 无论如何都是不显示的
  content?: string;

  // Tab 的顺序
  // 默认为 ['meta', 'preview', 'edit']
  tabs?: WnObjViewerBlockName[];

  // 哪些 block 需要放入 Pannal 来显示
  panels?: WnObjViewerBlockName[];

  /**
   * 元数据的字段
   */
  fields?: FieldRefer[];

  /**
   * 弹出面板的默认属性，如果不设置回从右侧滑入，占 62% 宽度
   */
  panelProps?: LayoutPanelProps;

  /**
   * 上传文件的设置
   */
  upload?: WnUploadFileOptions;
  /**
   * 空白数据，显示的样式
   */
  emptyRoadblock?: RoadblockProps;
};
