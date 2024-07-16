import {
  ActionBarProps,
  FieldStatus,
  KeepFeature,
  KeepInfo,
  LayoutProps,
  Pager,
  Vars,
  WnObjStatus,
} from '@site0/tijs';
import { ComputedRef, Ref } from 'vue';
import { WnObj } from '../../';
import { ObjEditFeatures } from '../edit/use-obj-edit-types';
import { ObjMetaStoreFeature } from '../use-obj-meta.store';
import { ObjContentStoreFeature } from '../use-obj-content.store';

export type QueryFilter = Vars;
export type QuerySorter = Record<string, number>;
export type QueryJoinOne = {
  /**
   * 查询的目标
   */
  path?: string;
  /**
   * 查询条件, 是一个以列表元素为上下文的Explain模板
   */
  query: QueryFilter;
  /**
   * 排序方式, 如果多个记录取第一个
   */
  sort?: QuerySorter;
  /**
   * 一个转换搜索对象的转换方法
   */
  explain?: Vars;
  /**
   * 【选】存放查询结果的键
   */
  toKey?: string;
};

export type AggQuery = {
  /**
   * 从传入的 filter 里过滤掉指定的条件
   */
  ignore?: any;

  /**
   * 指定更多的查询条件
   */
  match?: QueryFilter;

  /**
   * 聚集方法
   */
  by: string;
};

export type AggResult = Record<string, Record<string, any>[]>;

export type ModulePriviledge = {
  remove?: string;
  create?: string;
  update?: string;
  save?: string;
};

export type DirGUIViewBehaviors = {
  keepSelection?: KeepInfo;
  keepFilter?: KeepInfo;
  keepSorter?: KeepInfo;
  keepShown?: KeepInfo;
  filterIgnore?: string;
  fixedMatch?: QueryFilter;
  filter?: QueryFilter;
  sorter?: QuerySorter;
  joinOne?: QueryJoinOne;
  pager?: Pager;
  aggQuery?: string;
  aggSet?: Record<string, AggQuery>;
  aggAutoReload?: boolean;
};

export type DirGUIViewInfo = {
  // 从哪里加载列表
  indexPath?: string;
  // 动作菜单的加载文件
  actionPath?: string;
  // 布局文件
  layoutPath?: string;
  // Schema 文件
  schemaPath?: string;
  // 扩展的自定义函数集合
  methodPaths?: string[];
  // 指定视图的行为
  behaviors?: DirGUIViewBehaviors;
};

/*
----------------------------------------
                  Init
----------------------------------------
*/
export type DirInitSettings = {
  moduleName: Ref<string>;
  oHome: Ref<WnObj | undefined>;
  oHomeIndex: Ref<WnObj | undefined>;
  //............ GUI Loading Path
  actionPath: Ref<string | undefined>;
  layoutPath: Ref<string | undefined>;
  schemaPath: Ref<string | undefined>;
  methodPaths: Ref<string[] | undefined>;
  //............ behaviors
  behaviors: Ref<DirGUIViewBehaviors>;
};

export type DirInitGetters = {
  homeId: ComputedRef<string | undefined>;
  homeIndexId: ComputedRef<string | undefined>;
  isHomeExists: ComputedRef<boolean>;
  isThingSet: ComputedRef<boolean>;
};

export type DirInitActions = {
  initDirSettings: (obj?: WnObj) => Promise<void>;
};

export type DirInitFeature = DirInitSettings & DirInitGetters & DirInitActions;

/*
----------------------------------------
               GUI View 
----------------------------------------
*/

export type DirViewSettings = {
  pvg: Ref<ModulePriviledge>;
  guiShown: Ref<Vars | undefined>;
  actions: Ref<ActionBarProps | undefined>;
  layout: Ref<Omit<LayoutProps, 'schema'>>;
  schema: Ref<Pick<LayoutProps, 'schema'>>;
  methods: Ref<Record<string, Function>>;
};

export type DirViewActions = {
  resetView: () => void;
  loadView: () => Promise<void>;
  applyView: (
    be: DirGUIViewBehaviors,
    settings: DirQuerySettings & DirAggSettings
  ) => void;
  can_I_remove: () => boolean;
  can_I_create: () => boolean;
  can_I_update: () => boolean;
  can_I_save: () => boolean;
  updateShown: (shown: Vars) => void;
  mergeShown: (shown: Vars) => void;
  invoke: (methodName: string, ...args: any[]) => Promise<any>;
};

export type DirViewFeatures = DirViewSettings &
  DirViewActions & {
    hasActions: ComputedRef<boolean>;
  };

/*
----------------------------------------
               Local Storage
----------------------------------------
*/

export type DirKeeplInfo = Pick<DirViewSettings, 'guiShown'> &
  Pick<DirQuerySettings, 'filter' | 'sorter'> &
  Pick<DirSelection, 'currentId' | 'checkedIds'>;

export type DirUpdateSelection = (
  currentId?: string,
  checkedIds?: string[] | Map<string, boolean> | Record<string, boolean>
) => void;

export type DirKeepFeatures = {
  KeepSelection: ComputedRef<KeepFeature>;
  KeepFilter: ComputedRef<KeepFeature>;
  KeepSorter: ComputedRef<KeepFeature>;
  KeepShown: ComputedRef<KeepFeature>;
  saveSelection: (
    currentId?: string,
    checkedIds?: Record<string, boolean>
  ) => void;
  saveToLocal: (info: DirKeeplInfo) => void;

  restoreSelection: (
    currentId: Ref<string | undefined>,
    checkedIds: Ref<Record<string, boolean>>,
    updateSelection: DirUpdateSelection
  ) => void;
  restoreFromLocal: (
    info: DirKeeplInfo,
    updateSelection: DirUpdateSelection
  ) => void;
};

/*
----------------------------------------
               Query
----------------------------------------
*/
export type DirQuerySettings = {
  fixedMatch: Ref<QueryFilter | undefined>;
  filter: Ref<QueryFilter | undefined>;
  sorter: Ref<QuerySorter | undefined>;
  objKeys: Ref<string | undefined>;
  joinOne: Ref<QueryJoinOne | undefined>;
  pager: Ref<Pager | undefined>;
};

export type DirQueryGetters = {
  queryPageNumber: ComputedRef<number>;
  queryPageSize: ComputedRef<number>;
  isLongPager: ComputedRef<boolean>;
  isShortPager: ComputedRef<boolean>;
  isPagerEnabled: ComputedRef<boolean>;
};

export type DirSelection = {
  currentId: Ref<string | undefined>;
  checkedIds: Ref<Record<string, boolean>>;
  list: Ref<WnObj[]>;
  itemStatus: Ref<Record<string, WnObjStatus>>;
};

export type DirQueryMethods = {
  updateListItem: (meta: WnObj) => boolean;
  resetQuery: () => void;
  queryList: (flt?: QueryFilter) => Promise<void>;
};

export type DirQueryFeature = DirQuerySettings &
  DirQueryGetters &
  DirSelection &
  DirQueryMethods;

/*
----------------------------------------
              Agg
----------------------------------------
*/

export type DirAggSettings = {
  aggQuery: Ref<string | undefined>;
  aggSet: Ref<Record<string, AggQuery>>;
  aggAutoReload: Ref<boolean>;
};

export type DirAggActions = {
  resetAgg: () => void;
  loadAggResult: (flt?: QueryFilter) => Promise<void>;
};
export type DirAggFeature = DirAggSettings &
  DirAggActions & {
    aggResult: Ref<AggResult>;
  };

/*
----------------------------------------
              Selection
----------------------------------------
*/
export type DirSelectionFeature = {
  updateSelection: (
    currentId?: string,
    checkedIds?: string[] | Map<string, boolean> | Record<string, boolean>
  ) => void;
  clearSelection: () => void;
};

/*
----------------------------------------
            Reloading
----------------------------------------
*/
export type DirReloadingFeature = {
  reload: (obj?: WnObj) => Promise<void>;
  keepState: () => void;
};

/*
----------------------------------------
            GUI About
----------------------------------------
*/
export type DirGUIFeature = {
  GUIContext: ComputedRef<DirGUIContext>;
  explainLayout: () => Omit<LayoutProps, 'schema'>;
  explainSchema: () => Pick<LayoutProps, 'schema'>;
};

/*
----------------------------------------
            Editing
----------------------------------------
*/
export type DirEditingFeature = {
  guiNeedContent: Ref<boolean>;
  updateMeta: (meta: Vars) => void;
  saveMeta: () => Promise<void>;
  updateAndSave: (meta: Vars) => Promise<void>;
  create: (meta: Vars) => Promise<void>;
  autoLoadContent: () => Promise<void>;
};

/*
----------------------------------------
        Whole DirStore
----------------------------------------
*/
export type DirFeature = DirInitFeature &
  DirViewFeatures &
  DirQueryFeature &
  DirAggFeature &
  DirSelectionFeature &
  DirReloadingFeature &
  DirGUIFeature &
  DirEditingFeature & {
    _keep: ComputedRef<DirKeepFeatures>;
    _meta: ComputedRef<ObjMetaStoreFeature>;
    _content: ComputedRef<ObjContentStoreFeature>;
  };

export type DirInnerContext = {
  _dir: DirInitFeature;
  _query: DirQueryFeature;
  _agg: DirAggFeature;
  _view: DirViewFeatures;
};

export type DirInnerContext2 = DirInnerContext & {
  _meta: ComputedRef<ObjMetaStoreFeature>;
  _content: ComputedRef<ObjContentStoreFeature>;
};

export type DirGUIContext = {
  moduleName: string;
  oHome?: WnObj;
  oHomeIndex?: WnObj;
  //............ GUI Loading Path
  actionsPath?: string;
  layoutPath?: string;
  schemaPath?: string;
  methodPaths?: string[];
  //........... DirInitGetters
  homeId?: string;
  homeIndexId?: string;
  isHomeExists?: boolean;
  //........... DirQuerySettings
  fixedMatch?: QueryFilter;
  filter?: QueryFilter;
  sorter?: QuerySorter;
  objKeys?: string;
  joinOne?: QueryJoinOne;
  pager?: Pager;
  //........... DirQueryGetters
  queryPageNumber: number;
  queryPageSize: number;
  isLongPager: boolean;
  isShortPager: boolean;
  isPagerEnabled: boolean;
  currentMeta?: WnObj;
  //........... DirSelection
  currentId?: string;
  checkedIds?: Record<string, boolean>;
  list: WnObj[];
  itemStatus: Record<string, WnObjStatus>;
  //........... DirAggFeature
  aggQuery?: string;
  aggSet: Record<string, AggQuery>;
  aggAutoReload: boolean;
  aggResult: AggResult;
  //........... ObjEditState
  meta?: WnObj;
  // content?: string;
  // savedContent?: string;
  // contentPath?: string;
  // contentType?: string;
  // contentData?: any;
  fieldStatus: Record<string, FieldStatus>;
};
