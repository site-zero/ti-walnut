import {
  ActionBarItem,
  AsyncFuncA0,
  FieldStatus,
  LayoutProps,
  Pager,
  ShortNamePager,
  Vars,
  WnObjStatus,
} from '@site0/tijs';
import { WnObj } from '../../';
import { ComputedRef, Ref } from 'vue';

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

export type DirGUIViewInfo = {
  // 从哪里加载列表
  indexPath: string;
  // 动作菜单的加载文件
  actionsPath: string;
  // 布局文件
  layoutPath: string;
  // Schema 文件
  schemaPath: string;
  // 扩展的自定义函数集合
  methodPaths: string;
};

/*
----------------------------------------
                  Base
----------------------------------------
*/
export type DirBaseSettings = {
  moduleName: Ref<string>;
  oHome: Ref<WnObj | undefined>;
  oHomeIndex: Ref<WnObj | undefined>;
  //............ GUI Loading Path
  actionsPath: Ref<string | undefined>;
  layoutPath: Ref<string | undefined>;
  schemaPath: Ref<string | undefined>;
  methodPaths: Ref<string | undefined>;
};

export type DirViewSettings = {
  pvg: Ref<ModulePriviledge>;
  guiShown: Ref<Vars | undefined>;
  actions: Ref<ActionBarItem[] | undefined>;
  layout: Ref<Omit<LayoutProps, 'schema'> | undefined>;
  schema: Ref<Pick<LayoutProps, 'schema'> | undefined>;
  methods: Ref<Record<string, Function>>;
};

export type DirBaseGetters = {
  homeId: ComputedRef<string | undefined>;
  homeIndexId: ComputedRef<string | undefined>;
  isHomeExists: ComputedRef<boolean>;
};

export type DirBaseActions = {
  loadDirSettings: (obj?: WnObj) => Promise<void>;
};

export type DirBaseFeatures = DirBaseSettings & DirBaseGetters & DirBaseActions;

/*
----------------------------------------
               Local Storage
----------------------------------------
*/
export type DirLocalSettings = {
  localBehaviorKeepAt: Ref<string | undefined>;
  localBehaviorIgnore: Ref<string | undefined>;
};

/*
----------------------------------------
               Query
----------------------------------------
*/
export type DirQuerySettings = {
  fixedMatch: Ref<Vars | undefined>;
  filter: Ref<Vars | undefined>;
  sorter: Ref<Vars | undefined>;
  objKeys: Ref<string | undefined>;
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
  checkedIds: Ref<Record<string, boolean> | undefined>;
  list: Ref<WnObj[]>;
  itemStatus: Ref<Record<string, WnObjStatus>>;
};

export type DirQueryActions = {
  queryList: (flt?: QueryFilter) => Promise<void>;
};

export type DirQueryFeature = DirQuerySettings &
  DirQueryGetters &
  DirSelection &
  DirQueryActions;

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
  loadAggResult: (flt?: QueryFilter) => Promise<void>;
};
export type DirAggFeature = DirAggSettings &
  DirAggActions & {
    aggResult: Ref<AggResult>;
  };

/*
----------------------------------------
         Current Editing
----------------------------------------
*/
export type DirEditCurrentFeatures<T extends any = any> = {
  meta: Ref<WnObj | undefined>;
  content: Ref<string | undefined>;
  savedContent: Ref<string | undefined>;
  contentPath: Ref<string | undefined>;
  contentType: Ref<string | undefined>;
  contentData: Ref<T>;
  fieldStatus: Ref<Record<string, FieldStatus>>;
};

/*
----------------------------------------
        Whole DirStore
----------------------------------------
*/
export type DirFeatures = DirBaseFeatures &
  DirQueryFeature &
  DirAggFeature &
  {
    reload: (obj?:WnObj)=>Promise<void>
  }
  //DirEditCurrentFeatures;

export type ___old_state = {
  moduleName: string;
  pvg?: ModulePriviledge;
  view?: Vars;
  localBehaviorKeepAt?: string;
  localBehaviorIgnore?: string;
  exportSettings: Vars;
  importSettings: Vars;
  lbkAt?: string;
  lbkIgnore?: string;
  lbkOff: boolean;
  dirId?: string;
  oDir?: WnObj;
  mappingDirPath?: string;
  fixedMatch?: Vars;
  filter: Vars;
  sorter: Vars;
  objKeys?: string;
  list: WnObj[];
  currentId?: string;
  checkedIds?: Record<string, boolean>;
  pager: ShortNamePager;
  meta?: WnObj;
  content: string | null;
  __saved_content: string | null;
  contentPath: string;
  contentType: string;
  contentData?: any;
  contentQuietParse: boolean;
  fieldStatus: Vars;
  itemStatus: Vars;
  actionsPath?: string;
  layoutPath?: string;
  schemaPath?: string;
  methodPaths?: string;
  guiShown: Vars;
  objActions?: any[];
  layout?: any;
  schema?: any;
  objMethods?: Vars;
};
