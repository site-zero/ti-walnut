import {
  ActionBarEvent,
  ComboFilterProps,
  ComboFilterValue,
  FormProps,
  GridFieldsProps,
  KeepMode,
  LayoutGridProps,
  LayoutSchema,
  PagerProps,
  RoadblockProps,
  TableProps,
  TableRowID,
  TableSelectEmitInfo,
  Vars,
} from '@site0/tijs';
import { ComputedRef } from 'vue';
import { SqlQuery, SqlResult } from '../../../..';
import { DataListStoreFeature, DataListStoreOptions } from '../../_store';

export type RdsBrowserMsgKey = 'warn_refresh' | 'warn_drop_change';

export type RdsBrowserProps = {
  /**
   * 一个唯一的名称，用来作为本地状态持久化的的键的主要特征
   */
  keepName?: string;

  defaultKeepMode?: KeepMode;

  keepModes?: Record<string, KeepMode>;

  /**
   * 快速的指定界面布局的列，默认就是 '50% 1fr'
   */
  layoutQuickColumns?: string;

  messages?: Record<RdsBrowserMsgKey, string>;
  createNewItem?: (Data: DataListStoreFeature) => Vars;
  getItemId?: TableRowID | ((it: Vars) => TableRowID | undefined);

  //--------------------------------------------------
  // 定制界面
  //--------------------------------------------------
  guiLayout?: (layout: LayoutGridProps) => LayoutGridProps;
  guiSchema?: (
    schema: LayoutSchema,
    Data: DataListStoreFeature,
    rds: RdsBrowserFeature
  ) => LayoutSchema;

  //--------------------------------------------------
  // 数据访问
  //--------------------------------------------------
  dataStore: DataListStoreOptions;

  //--------------------------------------------------
  // 数据表单
  //--------------------------------------------------
  form?: Omit<FormProps, 'data'>;

  //--------------------------------------------------
  // 数据表格
  //--------------------------------------------------
  table?: Omit<TableProps, 'data'>;

  //--------------------------------------------------
  // 搜索过滤器
  //--------------------------------------------------
  filter?: ComboFilterProps;
};

//--------------------------------------------------
// 定义特性
//--------------------------------------------------
export type RdsBrowserFeature = {
  TableEmptyRoadblock: ComputedRef<RoadblockProps>;
  StatusVars: ComputedRef<Vars>;

  TableCurrentId: ComputedRef<TableRowID | undefined>;
  TableCheckedIds: ComputedRef<Map<TableRowID, boolean>>;
  DefaultFilterQuery: ComputedRef<SqlQuery>;

  DataFilterConfig: ComputedRef<ComboFilterProps>;
  DataPagerConfig: ComputedRef<PagerProps>;
  DataTableConfig: ComputedRef<TableProps>;
  DataFormConfig: ComputedRef<GridFieldsProps>;

  // 方法
  refresh: () => Promise<void>;

  // 响应事件
  onTableRowSelect: (payload: TableSelectEmitInfo) => void;
  onFilterChange: (payload: ComboFilterValue) => void;
  onFilterReset: () => void;
  onPageNumberChange: (pn: number) => void;
  onPageSizeChange: (pgsz: number) => void;
  onCurrentMetaChange: (payload: SqlResult) => void;
  onActionFire: (barEvent: ActionBarEvent) => void;
};
