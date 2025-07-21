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
import { ComputedRef } from 'vue';
import { RdsListStoreApi, RdsListStoreOptions } from '../../../_store';
import { useRdsBrowser } from './use-rds-browser';

export type RdsBrowserEmitter = {
  (event: 'create:item', ctx: RdsCreateNewItemContext): void;
};

export type RdsBrowserMsgKey = 'warn_refresh' | 'warn_drop_change';
export type RdsBrowserActionHandleMark = 'handled' | 'unhandled';

export type RdsCreateNewItemContext = {
  store: RdsListStoreApi;
  /**
   * 如果声明了 genNewId，则会传递这个新的 ID
   */
  newId?: string;
};

export type KeepTarget =
  | 'Query'
  | 'Selection'
  | 'Filter-Major'
  | 'Table-Columns'
  | 'GUI-Layout-Sizes';

export type RdsBrowserProps = {
  /**
   * 一个唯一的名称，用来作为本地状态持久化的的键的主要特征
   */
  keepName?: string;

  defaultKeepMode?: KeepMode;

  keepModes?: Partial<Record<KeepTarget, KeepMode | 'no-keep' | undefined>>;

  /**
   * 界面mount后，是否自动加载数据
   */
  autoReload?: boolean;

  onSetup?: (api: ComputedRef<RdsBrowserApi>) => void;

  /**
   * 快速的指定界面布局的列，默认就是 '50% 1fr'
   */
  layoutQuickColumns?: string;

  /**
   * 快速的指定界面布局的行，默认就是 'auto auto 1fr auto'
   */
  layoutQuickRows?: string;

  /**
   * 指定下面几个消息的键:
   *
   * - `warn_refresh` 刷新时的警告消息
   * - `warn_drop_change` 放弃修改时的警告消息
   */
  messages?: Record<RdsBrowserMsgKey, string>;

  /**
   * 指定新数据的 ID 创建方法，支持下面的格式:
   *
   * - `uu32` => 'u8u5601vaejcbrk3p2k9iolrkb'
   * - `snowQ::10` => 'm8dd1ytjtehzard1t7'
   * - `snowQD::6` => '250317175109356skn81d'
   * - `seq::4:~/tmp/yyyy-MM#my_seq` => '0002'
   * - `seqD::4:~/tmp/yyyy-MM-dd#my_seq` => '2503170003'
   * - `seqHH::4:~/tmp/yyyy-MM-dd#my_seq` => '250317170005'
   */
  genNewId?: string;

  /**
   * 是否允许创建新数据，如果允许则需要通过这个选项指定一个创建新数据的方法
   *
   * - `null | undefined` 表示不允许创建新数据
   * - `Function` 可以同步也可以是异步函数表示完全自定义创建新数据的方法
   * - `true` 控件会发送一个事件，`(event: 'create:item', payload: RdsListStoreApi)`
   * - `Object` 普通对象，则表示对象模板，它会被 explain 为一个新的对象，
   *      explain 上下文为: `{id:'xxx',size:10, pager: {...}}`，
   *      其中 `id` 是为这个对象分配的 ID 不过需要声明 ID ，
   *      `pager` 表示当前的分页信息，是一个 SqlPager 的对象，包括
   *      `{pageNumber, pageSize, pageCount, totalCount}`
   *
   */
  createNewItem?:
    | null
    | Vars
    | true
    | ((ctx: RdsCreateNewItemContext) => Vars | undefined)
    | ((ctx: RdsCreateNewItemContext) => Promise<Vars | undefined>);

  /**
   * 指定如何获取数据项的 ID
   *
   * - `string` 表示直接使用数据项的属性值
   * - `function` 直接提供一个函数从数据项取值
   */
  getItemId?: string | ((it: Vars) => string | undefined);

  //--------------------------------------------------
  // 定制界面
  //--------------------------------------------------
  guiLayout?: (layout: LayoutGridProps, rds: RdsBrowserApi) => LayoutGridProps;
  guiSchema?: (schema: LayoutSchema, rds: RdsBrowserApi) => LayoutSchema;
  guiActionBar?: (
    actionBar: ActionBarProps,
    rds: RdsBrowserApi
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
    Data: RdsListStoreApi,
    name: string,
    payload: any
  ) => Promise<RdsBrowserActionHandleMark>;

  //--------------------------------------------------
  // 数据访问
  //--------------------------------------------------
  dataStore: RdsListStoreOptions;

  //--------------------------------------------------
  // 动作条
  //--------------------------------------------------
  actions?: ActionBarProps;

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
export type RdsBrowserApi = ReturnType<typeof useRdsBrowser>;
