import { ShortNamePager, Vars } from '@site0/tijs';
import { WnObj } from '../../';

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
