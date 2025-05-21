import {
  ComboFilterValue,
  getLogger,
  KeepInfo,
  Match,
  TableRowID,
  TableSelectEmitInfo,
  TiMatch,
  useKeep,
  Util,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { computed, reactive, ref } from 'vue';
import {
  DataStoreActionStatus,
  DataStoreLoadStatus,
  GlobalStatusApi,
  LocalListEditOptions,
  LocalListMakeChangeOptions,
  LocalListUpdateItemOptions,
  QueryFilter,
  QuerySorter,
  RefreshOptions,
  SqlPagerInput,
  SqlQuery,
  SqlResult,
  updatePager,
  updatePagerTotal,
  useLocalListEdit,
  useSqlx,
} from '../../';
import { Walnut } from '../../../core';

const log = getLogger('wn.use-data-list-store');

/**
 * 如果服务器的 SQL 是联合查询，通常查询的字段条件会有前缀
 * 而这个前缀在客户端设置会很讨厌，这里封装一个逻辑，根据不同的字段
 * 为其增加对应的前缀。
 *
 * 你当然可以通过一个函数自己判断，但是为了便利性也可以通过下面的映射对象
 * 来配置映射规则:
 *
 * ```js
 * {
 *    queryprefix : {
 *       "M." : "^(id|name|age)$",
 *    }
 * }
 *
 *  {"前缀" : <AutoMatch 对象>}
 * ```
 */
export type RedQueryPrefixSetup = Record<string, any> | RdsQueryPrefixAppender;
export type RdsQueryPrefixAppender = (key: string) => string;

export type RdsListStoreApi = ReturnType<typeof defineRdsListStore>;

export type RdsListStoreOptions = LocalListEditOptions & {
  daoName?: string;
  keepQuery?: KeepInfo;
  keepSelect?: KeepInfo;
  fixedMatch?:
    | QueryFilter
    | QueryFilter[]
    | (() => QueryFilter | QueryFilter[]);
  defaultFilter?: QueryFilter | (() => QueryFilter);
  query: SqlQuery | (() => SqlQuery);
  sqlQuery: string;
  sqlCount?: string;
  queryPrefix?: RedQueryPrefixSetup;
  countPrefix?: RedQueryPrefixSetup;
  makeChange?: LocalListMakeChangeOptions;
  refreshWhenSave?: boolean;
  patchRemote?: (remote: SqlResult, index: number) => SqlResult;
  /**
   * 当执行 createNewItem 时，会调用这个函数来生成上下文变量
   * 并交给 newItem 对象模板渲染
   *
   * 格式为 `{key: '<command>'}`
   */
  newItemVars?: Record<string, string>;
  newItem?: Vars;
  /**
   * 可选全局状态接口，如果指定，则在 Select 等时机会自动更新状态
   */
  globalStatus?: GlobalStatusApi;
};

function defineRdsListStore(options: RdsListStoreOptions) {
  //---------------------------------------------
  // 准备数据访问模型
  let sqlx = useSqlx(options.daoName);
  //---------------------------------------------
  // 本地保存
  let _keep_query = useKeep(options.keepQuery);
  let _keep_select = useKeep(options.keepSelect);
  //---------------------------------------------
  //              固定查询条件
  //---------------------------------------------
  function __create_fixed_match(): QueryFilter | QueryFilter[] {
    if (_.isFunction(options.fixedMatch)) {
      return options.fixedMatch();
    }
    if (options.fixedMatch) {
      return _.cloneDeep(options.fixedMatch);
    }
    return {};
  }
  function __create_default_filter(): QueryFilter {
    if (_.isFunction(options.defaultFilter)) {
      return options.defaultFilter();
    }
    if (options.defaultFilter) {
      return _.cloneDeep(options.defaultFilter);
    }
    return {};
  }
  //---------------------------------------------
  //              默认查询条件
  //---------------------------------------------
  function __create_data_query(): SqlQuery {
    let re: SqlQuery = {
      filter: {},
      sorter: {},
      pager: { pageNumber: 1, pageSize: 50 },
    };
    if (_.isFunction(options.query)) {
      let q = options.query();
      _.assign(re, q);
    } else {
      _.assign(re, options.query);
    }
    // 最后处理一下本地数据
    let local = _keep_query.loadObj();
    if (local?.filter) {
      re.filter = local?.filter;
    }
    if (!_.isEmpty(local?.sorter)) {
      re.sorter = local?.sorter;
    }
    if (local?.pager) {
      _.merge(re.pager, local.pager);
    }

    // 搞定
    return re;
  }
  //---------------------------------------------
  //              编制自动前缀
  //---------------------------------------------
  function __make_prefix_appender(
    prefix?: RedQueryPrefixSetup
  ): RdsQueryPrefixAppender {
    // 没有前缀
    if (!prefix) {
      return (key) => key;
    }
    // 完全自定义
    if (_.isFunction(prefix)) {
      return prefix;
    }
    // 采用定制规则
    let append_rules: [string, TiMatch][] = [];
    for (let [key, val] of Object.entries(prefix)) {
      append_rules.push([key, Match.parse(val)]);
    }
    return (key) => {
      for (let rule of append_rules) {
        let [pfx, am] = rule;
        if (am.test(key)) {
          return pfx + key;
        }
      }
      return key;
    };
  }
  const _query_prefix_append = computed(() =>
    __make_prefix_appender(options.queryPrefix)
  );
  const _count_prefix_append = computed(() =>
    __make_prefix_appender(options.countPrefix)
  );
  //---------------------------------------------
  function apply_query_prefix(
    query: SqlQuery,
    appender: RdsQueryPrefixAppender
  ) {
    const use_appender = (_v: any, k: string) => {
      let not = false;
      if (k.startsWith('!')) {
        not = true;
        k = k.substring(1).trim();
      }
      let newKey = appender(k);
      if (not) {
        return '!' + newKey;
      }
      return newKey;
    };
    if (query.filter) {
      query.filter = _.mapKeys(query.filter, use_appender);
    }
    if (query.sorter) {
      query.sorter = _.mapKeys(query.sorter, use_appender);
    }
  }
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const _remote = ref<SqlResult[]>();
  const _action_status = ref<DataStoreActionStatus>();
  const query = reactive(__create_data_query());
  const _current_id = ref<TableRowID>();
  const _checked_ids = ref<TableRowID[]>([]);
  //---------------------------------------------
  let selection = _keep_select.loadObj() ?? {};
  _current_id.value = selection.currentId;
  _checked_ids.value = selection.checkedIds || [];
  //---------------------------------------------
  function __save_local_query() {
    _keep_query.save({
      filter: query.filter,
      sorter: query.sorter,
      pager: {
        pageSize: query.pager?.pageSize,
      },
    });
  }
  //---------------------------------------------
  function __reset_local_query() {
    _keep_query.remove();
  }
  //---------------------------------------------
  function __save_local_select() {
    _keep_select.save({
      currentId: _current_id.value,
      checkedIds: _checked_ids.value,
    });
  }
  //---------------------------------------------
  function __reset_local_select() {
    _keep_select.remove();
  }
  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = useLocalListEdit(_remote, options);
  //---------------------------------------------
  const changed = computed(() => _local.isChanged());
  const isEmpty = computed(() => _.isEmpty(listData.value));
  const isRemoteEmpty = computed(() => _.isEmpty(_remote.value));
  const isLocalEmpty = computed(() => _.isEmpty(_local?.localList?.value));
  //---------------------------------------------
  const ActionStatus = computed(() => _action_status.value);
  //---------------------------------------------
  const ActionBarVars = computed(() => {
    return {
      loading: _action_status.value == 'loading',
      saving: _action_status.value == 'saving',
      changed: changed.value,
      empty: isEmpty.value,
      hasCurrent: hasCurrent.value,
      hasChecked: hasChecked.value,
    } as Vars;
  });
  //---------------------------------------------
  const LoadStatus = computed((): DataStoreLoadStatus => {
    if (_.isUndefined(_remote.value)) {
      return 'unloaded';
    }
    if (_remote.value.length == query.pager?.totalCount) {
      return 'full';
    }
    return 'partial';
  });

  //---------------------------------------------
  // 基础本地方法
  //---------------------------------------------
  function resetLocalChange() {
    _local.reset();
  }

  function clearRemoteList() {
    _remote.value = undefined;
    if (query.pager) {
      updatePagerTotal(query.pager, 0);
    }
  }

  function makeChanges() {
    // 保护一下
    if (!options.makeChange) {
      return [];
    }
    return _local.makeChanges(options.makeChange);
  }

  function makeDifferents(): Vars[] {
    let re: Vars[] = [];
    let diffs = _local.makeDifferents();
    for (let diff of diffs) {
      re.push(diff.delta);
    }
    return re;
  }
  //---------------------------------------------
  //                计算属性
  //---------------------------------------------
  const listData = computed(() => {
    return _local.localList.value || _remote.value || [];
  });
  const hasCurrent = computed(() => !_.isNil(_current_id.value));
  const hasChecked = computed(
    () => _checked_ids.value && _checked_ids.value.length > 0
  );

  function existsInRemote(id: TableRowID): boolean {
    return _local.existsInRemote(id);
  }

  /**
   * 获取数据的 ID
   */
  function getItemId(it: SqlResult, index: number = -1): TableRowID {
    return _local.getRowId(it, index);
  }

  function getItemById(id?: TableRowID) {
    if (_.isNil(id)) {
      return;
    }
    let index = _local.getRowIndex(id);
    if (index >= 0) {
      return listData.value[index];
    }
  }

  function getItemIndex(id: string) {
    return _local.getRowIndex(id);
  }

  function getItemByIndex(index: number) {
    if (index >= 0 && index < listData.value.length) {
      return listData.value[index];
    }
  }

  function getItemByMatch(match: any): SqlResult | undefined {
    let am = Match.parse(match, false);
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (am.test(it)) {
        return it;
      }
    }
  }

  function getItemBy(predicate: (it: SqlResult, index: number) => boolean) {
    return _.find(listData.value, predicate);
  }

  function getCurrentItem(): SqlResult | undefined {
    return getItemById(_current_id.value);
  }

  function getCheckedItems(): SqlResult[] {
    return findItemsById(_checked_ids.value);
  }

  function findItemsById(ids: TableRowID[]): SqlResult[] {
    let indexs = ids.map((id) => _local.getRowIndex(id));
    let re: SqlResult[] = [];
    for (let i of indexs) {
      if (i >= 0) {
        let it = listData.value[i];
        re.push(it);
      }
    }
    return re;
  }

  function findItemsByMatch(match: any): SqlResult[] {
    let re: SqlResult[] = [];
    let am = Match.parse(match, false);
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (am.test(it)) {
        re.push(it);
      }
    }
    return re;
  }

  function findItemsBy(
    predicate: (it: SqlResult, index: number) => boolean
  ): SqlResult[] {
    let re: SqlResult[] = [];
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (predicate(it, i)) {
        re.push(it);
      }
    }
    return re;
  }

  function getFilterField(key: string, dft?: any) {
    return _.get(query.filter, key) ?? dft;
  }

  function prependItem(item: SqlResult) {
    // 如果存在就更新
    let id = getItemId(item);
    if (getItemById(id)) {
      updateItem(item, { id });
    }
    // 直接添加到结尾
    else {
      _local.prependToList(item);
    }
  }

  function appendItem(item: SqlResult) {
    // 如果存在就更新
    let id = getItemId(item);
    if (getItemById(id)) {
      updateItem(item, { id });
    }
    // 直接添加到结尾
    else {
      _local.appendToList(item);
    }
  }

  function updateCurrent(meta: SqlResult): SqlResult | undefined {
    if (hasCurrent.value) {
      let uf = { id: _current_id.value };
      return _local.updateItem(meta, uf);
    }
  }

  function updateItem(
    meta: Vars,
    options: LocalListUpdateItemOptions
  ): SqlResult | undefined {
    return _local.updateItem(meta, options);
  }

  function updateItems(
    meta: SqlResult,
    forIds?: TableRowID | TableRowID[]
  ): SqlResult[] {
    return _local.batchUpdate(meta, forIds);
  }

  function updateChecked(meta: SqlResult): SqlResult[] {
    return _local.batchUpdate(meta, _checked_ids.value);
  }

  function removeChecked(): SqlResult[] {
    if (hasChecked.value) {
      // 首先查找一下可能是否需要高亮下一个的 ID
      let nextId = _local.getNextRowId(_checked_ids.value) as string;

      _action_status.value = 'deleting';
      let re = _local.removeLocalItems(_checked_ids.value);
      _action_status.value = undefined;

      // 选择下一个对象
      if (nextId) {
        selectItem(nextId);
      }
      // 没有后续可选的 id
      else {
        _current_id.value = undefined;
        _checked_ids.value = [];
      }

      return re;
    }
    return [];
  }

  function clear() {
    _local.clearItems();
  }

  function removeItems(forIds?: TableRowID | TableRowID[]): SqlResult[] {
    if (!_.isNil(forIds)) {
      let ids = _.concat([], forIds);
      return _local.removeLocalItems(ids);
    }

    return [];
  }
  //---------------------------------------------
  // 选择方法
  //---------------------------------------------
  async function onSelect(payload: TableSelectEmitInfo) {
    let currentId = (payload.currentId as string) ?? undefined;
    let checkedIds = Util.mapTruthyKeys(payload.checkedIds) as string[];
    await updateSelection(currentId, checkedIds);
    __save_local_select();
  }

  async function selectItem(id: string) {
    let currentId = id;
    let checkedIds = [id];
    await updateSelection(currentId, checkedIds);
    __save_local_select();
  }

  function updateSelection(
    currentId?: TableRowID | null,
    checkedIds?: TableRowID[]
  ) {
    if (_.isEmpty(checkedIds) && !_.isNil(currentId)) {
      checkedIds = [currentId];
    }
    _current_id.value = currentId ?? undefined;
    _checked_ids.value = checkedIds ?? [];

    // 更新全局状态
    if (options.globalStatus) {
      options.globalStatus.data.selectedRows = _checked_ids.value.length;
      options.globalStatus.data.currentObj = CurrentItem.value;
    }
  }

  function cancelSelection() {
    _current_id.value = undefined;
    _checked_ids.value = [];
    __reset_local_select();
  }

  const CurrentItem = computed(() => getCurrentItem());

  function setQuery(q: ComboFilterValue) {
    _.assign(query, q);
    __save_local_query();
  }

  function setFilter(filter: QueryFilter) {
    query.filter = _.cloneDeep(filter);
    __save_local_query();
  }

  function setSorter(sorter: QuerySorter) {
    query.sorter = _.cloneDeep(sorter);
    __save_local_query();
  }

  function setPager(page: Partial<SqlPagerInput>) {
    if (!query.pager) {
      query.pager = {
        pageNumber: 1,
        pageSize: 20,
      };
    }
    updatePager(query.pager, page);
    __save_local_query();
  }

  function addLocalItem(meta: SqlResult) {
    _local.appendToList(meta);
  }

  function __gen_query(): SqlQuery {
    let q = _.cloneDeep(query);
    q.filter = q.filter ?? {};
    q.filter = Util.filterRecordNilValueDeeply(q.filter);

    // 融合两个条件
    let fixed = __create_fixed_match();
    let filter_is_array = _.isArray(q.filter);
    let fixed_is_array = _.isArray(fixed);

    // 都是数组，那么就联合 OR
    if (filter_is_array && fixed_is_array) {
      q.filter = _.concat(q.filter, fixed);
    }
    // 只有 q.filter 是数组，那么就逐个加入 fixed
    else if (filter_is_array) {
      for (let flt of q.filter as Vars[]) {
        _.assign(flt, fixed as Vars);
      }
    }
    // 只有 fixed 是数组，那么就逐个加入 q.filter 为默认值
    else if (fixed_is_array) {
      let filter = [];
      for (let fx of fixed as Vars[]) {
        filter.push(_.defaults(fx, q.filter as Vars));
      }
      q.filter = filter;
    }
    // 否则直接合并
    else {
      _.assign(q.filter, fixed as Vars);
    }

    //
    if (_.isEmpty(q.filter)) {
      q.filter = __create_default_filter();
    }
    return q;
  }
  //---------------------------------------------
  //               远程方法
  //---------------------------------------------
  async function createNewItem() {
    // 准备上下文
    let ctx = {} as Vars;
    if (options.newItemVars) {
      for (let [key, cmd] of Object.entries(options.newItemVars)) {
        ctx[key] = _.trim(await Walnut.exec(cmd));
      }
    }

    // 得到新对象
    let newItem = Util.explainObj(ctx, options.newItem ?? {});

    // 记入本地
    _local.prependToList(newItem);
  }
  //---------------------------------------------
  async function queryRemoteList(): Promise<void> {
    _action_status.value = 'loading';
    // 准备查询条件
    let q = __gen_query();
    apply_query_prefix(q, _query_prefix_append.value);
    // console.log('queryRemoteList', q);
    let list = await sqlx.query(options.sqlQuery, q);
    if (options.patchRemote) {
      let list2 = [] as SqlResult[];
      for (let i = 0; i < list.length; i++) {
        let li = _.cloneDeep(list[i]);
        let li2 = options.patchRemote(li, i);
        if (li2) {
          list2.push(li2);
        }
      }
      list = list2;
    }
    _remote.value = list ?? [];
    _action_status.value = undefined;
  }
  //---------------------------------------------
  async function countRemoteList() {
    // 防空
    if (!options.sqlCount) {
      return;
    }
    _action_status.value = 'loading';
    let q = __gen_query();
    apply_query_prefix(q, _count_prefix_append.value);
    let total = await countRemote(q.filter);
    if (query.pager) {
      updatePagerTotal(query.pager, total);
    }
    _action_status.value = undefined;
  }
  //---------------------------------------------
  async function countRemote(filter: Vars | Vars[]): Promise<number> {
    if (!options.sqlCount) {
      return 0;
    }
    let total = await sqlx.count(options.sqlCount, filter);
    return total;
  }
  //---------------------------------------------
  async function reload() {
    resetLocalChange();
    //remoteList.value = undefined;
    await Promise.all([queryRemoteList(), countRemoteList()]);
  }
  //---------------------------------------------
  /**
   * 刷新函数，根据提供的选项执行刷新操作。
   */
  async function refresh(options: RefreshOptions = {}) {
    if (options.reset) {
      resetLocalChange();
    }
    await Promise.all([queryRemoteList(), countRemoteList()]);
  }
  //---------------------------------------------
  //               远程更新方法
  //---------------------------------------------
  async function saveChange({ transLevel = 0 } = {}) {
    // 获取改动信息
    let changes = makeChanges();
    log.debug('saveChange', changes);
    // 保护一下
    if (changes.length == 0) {
      return;
    }
    //console.log('changes', changes);
    // 执行更新
    _action_status.value = 'saving';
    await sqlx.exec(changes, {
      transLevel,
    });
    _action_status.value = undefined;

    // 更新远程结果
    if (options.refreshWhenSave) {
      queryRemoteList().then(() => {
        //强制取消本地改动
        _local.reset();
      });
    }
  }

  //---------------------------------------------
  //  输出特性
  //---------------------------------------------
  return {
    // 数据模型
    _keep_query,
    _keep_select,
    _local,
    _remote,
    currentId: _current_id,
    checkedIds: _checked_ids,
    query,
    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    remoteList: computed(() => _remote.value),
    ActionStatus,
    ActionBarVars,
    LoadStatus,
    listData,
    hasCurrent,
    hasChecked,
    changed,
    isEmpty,
    isRemoteEmpty,
    isLocalEmpty,
    CurrentItem,
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
    //isChanged: () => _local.isChanged(),
    existsInRemote,
    getItemId,
    getItemIndex,
    getItemById,
    getItemByIndex,
    getItemByMatch,
    getItemBy,
    getCurrentItem,
    getCheckedItems,
    findItemsById,
    findItemsByMatch,
    findItemsBy,
    getFilterField,
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    resetLocalChange,
    clearRemoteList,

    setQuery,
    setFilter,
    setSorter,
    setPager,

    addLocalItem,

    appendItem,
    prependItem,

    updateCurrent,
    updateItem,
    updateItems,
    updateChecked,

    removeChecked,
    removeItems,
    clear,
    updateSelection,
    cancelSelection,

    //---------------------------------------------
    // 本地化存储状态
    //---------------------------------------------
    saveLocalQuery: __save_local_query,
    resetLocalQuery: __reset_local_query,
    saveLocalSelect: __save_local_select,
    resetLocalSelect: __reset_local_select,
    //---------------------------------------------
    //                  与控件绑定
    //---------------------------------------------
    onSelect,
    selectItem,
    //---------------------------------------------
    //                  远程方法
    //---------------------------------------------
    createNewItem,
    countRemoteList,
    countRemote,
    queryRemoteList,
    makeChanges,
    makeDifferents,
    saveChange,
    reload,
    refresh,
  };
}

/**
 * 维持全局单例
 */
//const _stores = new Map<string, DataListStoreFeature>();

export function useRdsListStore(options: RdsListStoreOptions): RdsListStoreApi {
  return defineRdsListStore(options);
}
