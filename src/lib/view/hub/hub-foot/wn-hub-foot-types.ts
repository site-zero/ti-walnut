import {
  FlexAlignment,
  IconInput,
  TipBoxProps,
  ValuePipeProps,
  Vars,
} from '@site0/tijs';
import { HubFootTipsProps } from './use-hub-foot-tips';

/**
 * 分组类型
 *
 * - `default` - 根据全局信息以及会话信息渲染【默认】
 * - `selection` - 本组就是显示选择项目数量
 * - `view` - 本组就是显示视图信息
 */
export type FootPartType = 'default' | 'selection' | 'view';

export type FootPart = {
  type?: FootPartType;
  icon?: IconInput | (() => IconInput);
  text?: string;
  suffix?: string;
  align?: FlexAlignment;
  flex?: string;
  style?: Vars;
  items?: FootPartItem[];
};

export type FootPartItemType = 'std-id' | 'text' | 'date' | 'datetime';

export type FootPartItem = ValuePipeProps & {
  icon?: IconInput | ((ctx: Vars) => IconInput);
  text?: string;
  /**
   * 指定一个提示框, 如果是一个对象，则表示提示信息配置模板，会被 explain
   * 上下文就是整个 hub_view 的 global.data
   *
   * 如果是一个字符串，那么就表示更加动态的获取方式，
   * 它会从 `tipMakers` 查找对应计算函数以便生成 tip 消息
   *
   * 如果是字符串， 可以用这样的形式 `DT-UTC=Created On`
   *
   * 这样， `tipMaker` 可以多接受到一个参数 `title=Created On
   */
  tip?: Partial<TipBoxProps> | string;
  suffix?: string;
  value?: string;
  style?: Vars;
  action?: (item: DisplayFootPartItem) => void;
};

export type WnHubFootProps = HubFootTipsProps & {
  align?: FlexAlignment;
  parts?: FootPart[];
};

/**
 * @public
 * 用于展示的底部部件条目类型，继承自 FootPartItem 并添加了索引、键、类型和原始值属性。
 */
export type DisplayFootPartItem = Omit<FootPartItem, 'icon'> & {
  icon?: IconInput;
  index: number;
  itemKey: string;
  type: FootPartItemType;
  rawValue: string;
  tipId?: number;
};

/**
 * @public
 * 用于展示的底部部件类型，继承自 FootPart 并添加了索引、键和部件条目数组属性。
 */
export type DisplayFootPart = {
  index: number;
  uniqKey: string;
  type: FootPartType;
  icon?: IconInput;
  text?: string;
  suffix?: string;
  style?: Vars;
  items: DisplayFootPartItem[];
};
