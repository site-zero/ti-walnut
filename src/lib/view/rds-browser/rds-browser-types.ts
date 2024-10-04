import {
  ActionBarProps,
  ComboFilterProps,
  FormProps,
  KeepMode,
  LayoutGridProps,
  LayoutSchema,
  TableProps,
  TableRowID,
  Vars,
} from '@site0/tijs';
import { DataListStore, DataListStoreOptions } from '../../_store';
import { useRdsBrowser } from './use-rds-browser';

export type RdsBrowserMsgKey = 'warn_refresh' | 'warn_drop_change';
export type RdsBrowserActionHandleMark = 'handled' | 'unhandled';

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
  createNewItem?: null | ((Data: DataListStore) => Vars);
  getItemId?: TableRowID | ((it: Vars) => TableRowID | undefined);

  //--------------------------------------------------
  // 定制界面
  //--------------------------------------------------
  guiLayout?: (
    layout: LayoutGridProps,
    Data: DataListStore,
    rds: RdsBrowserFeature
  ) => LayoutGridProps;
  guiSchema?: (
    schema: LayoutSchema,
    Data: DataListStore,
    rds: RdsBrowserFeature
  ) => LayoutSchema;
  guiActionBar?: (
    actionBar: ActionBarProps,
    Data: DataListStore,
    rds: RdsBrowserFeature
  ) => ActionBarProps;

  //--------------------------------------------------
  // 动作行为
  //--------------------------------------------------
  /**
   * 自定义时间处理行为
   *
   * @param name 事件名称
   * @param payload 事件参数
   * @returns 处理标识
   *  - `true` 表示事件已经被处理，不再继续处理了
   *  - `false` 表示事件未被处理，会采用默认行为处理
   */
  handleAction?: (
    Data: DataListStore,
    name: string,
    payload: any
  ) => Promise<RdsBrowserActionHandleMark>;

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
export type RdsBrowserFeature = ReturnType<typeof useRdsBrowser>;
