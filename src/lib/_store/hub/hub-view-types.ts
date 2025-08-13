import {
  ActionBarEvent,
  ActionBarProps,
  BlockEvent,
  KeepInfo,
  LayoutProps,
  LayoutSchema,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { Ref } from "vue";
import { Router } from "vue-router";
import { GlobalStatusApi } from "../../_features";
import { GuiViewLayout, GuiViewLayoutMode, WnObj } from "../../_types";
import { GuiViewMeasureApi } from "../use-gui-view-measure.store";
import { UserSessionApi } from "../use-session.store";

export type HubModelOptions = {
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
   *
   * 默认支持下面五种模型:
   *
   * - EMPTY
   * - STD-LIST
   * - STD-META
   * - RDS-LIST
   * - RDS-META
   */
  model: string;

  // 传递模型的配置数据
  // 对应这个对象，不同视图可以有自己不同的理解
  modelOptions?: Vars;
};

export type HubModelCreateSetup = {
  global: GlobalStatusApi;
  hubObj: WnObj;
  modelOptions?: Vars;
  objId?: string;
};

/**
 * 对于 WnHub 每个数据对象（目录|文件）都对应一个统一的逻辑视图
 * 它包括下面的信息
 *
 * 1. 数据模型
 */
export type HubViewOptions = HubModelOptions & {
  viewName: string;
  // 动作菜单的加载文件
  actions?: string | (() => ActionBarProps) | (() => Promise<ActionBarProps>);
  // 布局文件
  layout?:
    | string
    | (() => HubViewLayoutInput)
    | (() => Promise<HubViewLayoutInput>);
  // Schema 文件
  schema?: string | (() => LayoutSchema) | (() => Promise<LayoutSchema>);
  // 扩展的自定义函数集合
  methods?: string[];
};

/**
 * 内置支持的四种数据模型
 */
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

export type HubViewState = {
  /**
   * 动作菜单
   */
  actions: Ref<ActionBarProps>;
  /**
   * 布局
   */
  layout: Ref<GuiViewLayout>;
  /**
   * 控件定义
   */
  schema: Ref<LayoutSchema>;
  /**
   * 扩展方法
   */
  methods: Record<string, Function>;
};

export interface HubModel {
  modelType: string;
  store: any;
  createGUIContext: () => Vars;
  getActionBarVars: () => Vars;
  reload: () => Promise<void>;
  refresh: () => Promise<void>;
  getChanges: () => Vars[];
}

export function isHubViewLayout(layout: any): layout is GuiViewLayout {
  if (!layout) return false;
  let keys = _.keys(layout);
  if (keys.length <= 0 || keys.length > 3) {
    return false;
  }
  for (let k of keys) {
    if (!/^(desktop|pad|phone)$/.test(k)) {
      return false;
    }
  }
  return true;
}

export type HubViewLayoutInput = Partial<GuiViewLayout> | LayoutProps;

/**
 * 这个是给控件用的类型，通常由 Pinia 包裹导出
 */
export type HubView = {
  model?: HubModel | undefined;
  Options?: HubViewOptions | undefined;
  isViewLoading?: boolean;
  ActioinBarVars?: Vars;

  // Other API
  global: GlobalStatusApi;
  session: UserSessionApi;
  measure: GuiViewMeasureApi;
  router: Router;

  // HubViewState
  actions: Vars;
  layout: Vars;
  schema: Vars;
  methods: Record<string, Function>;

  // Utility
  getQuitPath: () => string | undefined;

  // methods
  setLoading: (loading: boolean) => void;
  createGUIContext: () => Vars;
  createWatchingObj: () => Vars;
  createGUILayout: (GUIContext: Vars, viewMode: GuiViewLayoutMode) => Vars;
  createGUISchema: (GUIContext: Vars) => Vars;
  createGUIActions: (GUIContext: Vars) => ActionBarProps;
  reload: (
    hubObj: WnObj,
    options: HubViewOptions,
    objId?: string
  ) => Promise<void>;
  invoke: (methodName: string, ...args: any[]) => Promise<any>;
  onBlockEvent: (event: BlockEvent) => Promise<any>;
  onActionFire: (event: ActionBarEvent) => Promise<any>;
  showModelDiff: () => Promise<void>;
};

export type GuiViewMeasure = {
  viewMode: keyof GuiViewLayout;
  setViewMode: (mode: GuiViewLayoutMode) => void;
};
