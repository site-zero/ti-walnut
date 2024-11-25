import { KeepInfo, Vars } from '@site0/tijs';

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
   * - 本地保存信息
   */
  model: HubDataModel;

  // 修改模型的默认行为
  // 对应这个对象，不同视图可以有自己不同的理解
  behaviors?: Vars;

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
export type HubDataModel = 'STD-LIST' | 'STD-META' | 'RDS-LIST' | 'RDS-META';
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
