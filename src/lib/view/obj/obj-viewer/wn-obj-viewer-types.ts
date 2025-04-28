import {
  BlockEvent,
  BlockProps,
  FieldRefer,
  FormProps,
  LayoutPanelProps,
  RoadblockProps,
  TabsAspect,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { WnUploadFileOptions } from '../../../../core';

export type WnObjViewerEmitter = {
  (event: 'show-content', contentIsShown: boolean): void;
  (event: 'meta-change', delta: Vars): void;
  (event: 'content-change', content: string): void;
};

export type WnObjViewerEmitEventName =
  | 'show-content'
  | 'meta-change'
  | 'content-change';

export function isWnObjViewerEmitEventName(
  input: any
): input is WnObjViewerEmitEventName {
  return /^(show-content|meta-change|content-change)$/.test(input);
}

export type WnObjViewerHandlerPayload = {
  event: BlockEvent;
  meta: Vars;
  content: string;
  ContentData: any;
};

export type WnObjViewerEmitEventHandler = {
  (payload: WnObjViewerHandlerPayload, emit: WnObjViewerEmitter): void;
};

export type WnObjViewerPartialChange = {
  /**
   * 如果不指定模式，那么就会直接修改对应的键
   * - merge: 深层合并对应键的对象
   * - assign: 浅层合并对应键的对象
   */
  setMode?: 'merge' | 'assign';
  /**
   * 键路径
   */
  setPath: string;
};
export function isWnObjViewerPartialChange(
  input: any
): input is WnObjViewerPartialChange {
  return _.isString(input?.setPath);
}

export type WnObjViewerBlockRouter =
  | WnObjViewerEmitEventName
  | WnObjViewerPartialChange
  | WnObjViewerEmitEventHandler;

export type WnObjViewerProps = TabsAspect & {
  meta?: Vars;

  // 对于 DIR 无论如何都是不显示的
  content?: string;

  // Tab 的顺序
  // 默认为 ['meta', 'preview', 'content']
  tabs?: string[];

  /**
   * 指定哪个 Tab 是内容块，控件可以通过这个通知外部模型
   * 自己需要展示 content, 模型需要为其加载对应数据的内容
   *
   * @default 'content'
   */
  contentTab?: string | string[];

  /**
   * 如果通知内容改动，转 JSON 的时候，自动格式化
   *
   * - `0`: 不格式化
   * - `2`: 格式化，采用 2 个空格缩进
   * - `3`: 格式化，采用 3 个空格缩进
   * - `4`: 格式化，采用 4 个空格缩进
   *
   * @default 2
   */
  formatJsonIndent?: number;

  // 哪些 block 需要放入 Pannal 来显示
  panels?: string[];

  /**
   * 指明了哪些块是动态的块，块初始化的时候，`schema`配置需要 `explainObj`
   * 上下文就是 `{meta, content, ContentData}`
   * 其中 ContentData 是从 content 解析出来的 JSON 对象
   * （如果解析失败），它就是 null
   */
  dynamicBlocks?: string[];

  /**
   * 定制更多的标签项目，默认的控件提供了
   * - meta: 元数据
   * - preview: 预览
   * - content: 编辑内容
   * 这三个块的默认实现。
   *
   * 如果想增加更多标签页，或者覆盖内置三个块的默认实现
   * 需要在这里声明
   */
  blocks?: Record<string, BlockProps>;

  /**
   * 每个块，事件的理由策略
   *
   * - 键名: 块事件`BlockEvent`的 `evetnName`
   * - 键值: 三种种类型
   *     - `WnObjViewerEmitEventName` 直接通知事件改动
   *          - 'show-content'
   *          - 'meta-change'
   *          - 'content-change';
   *     - `WnObjViewerPartialChange`
   *          - `{key:'KeyOfContent'}` 修改部分内容
   *     - `(event: BlockEvent, emit: WnObjViewerEmitter) => void`
   *          - 可以完全自定义事件的处理逻辑
   */
  blockEventRouter?: Record<string, WnObjViewerBlockRouter>;

  /**
   * 元数据的字段
   */
  fields?: FieldRefer[];

  /**
   * 元数据表单的配置信息
   */
  metaFormConf?: Omit<FormProps, 'fields'>;

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
