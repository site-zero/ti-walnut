import { ShortNamePager, Vars } from '@site0/tijs';
import { WnObj } from '../../';

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

export type QueryAgg = {
  /**
   * 从传入的 filter 里过滤掉指定的条件
   */
  ignore?: any;

  /**
   * 指定更多的查询条件
   */
  match?: QueryFilter

  by: ""
};

export type ModulePriviledge = {
  remove?: null | string;
  create?: null | string;
  update?: null | string;
  save?: null | string;
};

export type CurrentDirState = {
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

export type CurrentDirGetters = {
  isPagerEnabled: () => boolean;
};

export interface CurrentDirActions {
  queryList: () => WnObj[];
}
