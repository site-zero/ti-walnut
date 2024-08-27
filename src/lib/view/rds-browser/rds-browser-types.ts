import { ComboFilterProps, FormProps, KeepMode, TableProps } from '@site0/tijs';
import { DataListStoreOptions } from '../../_store';

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
