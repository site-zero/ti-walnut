import {
  ActionBarProps,
  KeepInfo,
  LayoutProps,
  LayoutSchema,
  Vars,
} from '@site0/tijs';
import { Ref } from 'vue';

/**
 * 对于 WnHub 每个数据对象（目录|文件）都对应一个统一的逻辑视图
 * 它包括下面的信息
 *
 * 1. 数据模型
 */
export type HubViewOptions = {
  /**
   * 视图采用的数据模型
   *
   * 一个数据模型一般包括下面的信息:
   *
   * - 远端数据
   * - 本地数据
   * - 查询/排序等条件
   * - 翻页信息
   * - 选择状态
   * - 本地保存的状态信息
   *
   * 这个模型终会提供一个 `createContext()` 的方法
   * 返回一个上下文对象，从而可以具体渲染 layout/schema/actions
   */
  model: HubDataModelType;

  // 传递模型的配置数据
  // 对应这个对象，不同视图可以有自己不同的理解
  modelOptions?: Vars;

  // 动作菜单的加载文件
  actionPath?: string;
  // 布局文件
  layoutPath?: string;
  // Schema 文件
  schemaPath?: string;
  // 扩展的自定义函数集合
  methodPaths?: string[];
};

/**
 * 内置支持的四种数据模型
 */
export type HubDataModelType =
  | 'STD-LIST'
  | 'STD-META'
  | 'RDS-LIST'
  | 'RDS-META';
export type HubViewBehaviors = {
  keepSelection?: KeepInfo;
  keepFilter?: KeepInfo;
  keepSorter?: KeepInfo;
  keepShown?: KeepInfo;
  filterIgnore?: string;
  fixedMatch?: Vars;
  filter?: Vars;
  sorter?: Record<string, number>;
};

export type HubViewLayout = {
  desktop: LayoutProps;
  pad: LayoutProps;
  phone: LayoutProps;
};

export type HubViewState = {
  /**
   * 动态渲染上下文
   */
  createContext: () => Vars;
  /**
   * 动作菜单
   */
  actions: Ref<ActionBarProps>;
  /**
   * 布局
   */
  layout: Ref<HubViewLayout>;
  /**
   * 控件定义
   */
  schema: Ref<LayoutSchema>;
  /**
   * 扩展方法
   */
  methods: Record<string, Function>;
};
