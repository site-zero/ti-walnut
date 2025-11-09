import {
  apply_conflict_list,
  buildConflictList,
  BuildConflictListOptions,
  buildDifferentListItems,
  ComboFilterValue,
  KeepInfo,
  Match,
  TableSelectEmitInfo,
  TiMatch,
  useKeep,
  Util,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { computed, ref } from "vue";
import {
  DataStoreActionStatus,
  DataStoreLoadStatus,
  GlobalStatusApi,
  ListStoreConflicts,
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
} from "../../";
import { Walnut } from "../../../core";

const debug = false;

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
  let _keep_query = computed(() => useKeep(options.keepQuery));
  let _keep_select = computed(() => useKeep(options.keepSelect));
  //---------------------------------------------
  //              固定查询条件
  //---------------------------------------------
  function __create_fixed_match(): QueryFilter | QueryFilter[] {
    if (_.isFunction(options.fixedMatch)) {
      return options.fixedMatch();
    }
    if (options.fixedMatch) {
      return Util.jsonClone(options.fixedMatch);
    }
    return {};
  }
  function __create_default_filter(): QueryFilter {
    if (_.isFunction(options.defaultFilter)) {
      return options.defaultFilter();
    }
    if (options.defaultFilter) {
      return Util.jsonClone(options.defaultFilter);
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
    let local = _keep_query.value.loadObj();
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
      if (k.startsWith("!")) {
        not = true;
        k = k.substring(1).trim();
      }
      let newKey = appender(k);
      if (not) {
        return "!" + newKey;
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
  const _query = ref(__create_data_query());
  const _current_id = ref<string>();
  const _checked_ids = ref<string[]>([]);
  //---------------------------------------------
  let selection = _keep_select.value.loadObj() ?? {};
  _current_id.value = selection.currentId;
  _checked_ids.value = selection.checkedIds || [];
  //---------------------------------------------
  function __save_local_query() {
    _keep_query.value.save({
      filter: _query.value.filter,
      sorter: _query.value.sorter,
      pager: {
        pageSize: _query.value.pager?.pageSize,
      },
    });
  }
  //---------------------------------------------
  function __reset_local_query() {
    _keep_query.value.remove();
  }
  //---------------------------------------------
  function __save_local_select() {
    _keep_select.value.save({
      currentId: _current_id.value,
      checkedIds: _checked_ids.value,
    });
  }
  //---------------------------------------------
  function __reset_local_select() {
    _keep_select.value.remove();
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
      loading: _action_status.value == "loading",
      saving: _action_status.value == "saving",
      changed: changed.value,
      empty: isEmpty.value,
      hasCurrent: hasCurrent.value,
      hasChecked: hasChecked.value,
    } as Vars;
  });
  //---------------------------------------------
  const LoadStatus = computed((): DataStoreLoadStatus => {
    if (_.isUndefined(_remote.value)) {
      return "unloaded";
    }
    if (_remote.value.length == _query.value.pager?.totalCount) {
      return "full";
    }
    return "partial";
  });
  //---------------------------------------------
  const Pager = computed(() => _query.value.pager);
  const Filter = computed(() => _query.value.filter);
  const Sorter = computed(() => _query.value.sorter);
  //---------------------------------------------
  // 基础本地方法
  //---------------------------------------------
  function dropChange() {
    _local.reset();
  }

  function clearRemoteList() {
    _remote.value = undefined;
    if (_query.value.pager) {
      updatePagerTotal(_query.value.pager, 0);
    }
  }

  function setRemoteList(list: SqlResult[]) {
    _remote.value = list;
  }

  function resetLocalAndRemote() {
    dropChange();
    clearRemoteList();
  }

  /**
   * 根据配置生成数据变更对象数组
   *
   * 如果未配置 `makeChange` 选项，则返回空数组。
   * 否则调用 `_local.makeChanges` 方法生成变更对象数组。
   *
   * @returns 返回数据变更对象数组，未配置变更选项时返回空数组
   */
  function makeChanges() {
    // 保护一下
    if (!options.makeChange) {
      return [];
    }
    return _local.makeChanges(options.makeChange);
  }

  /**
   * 生成数据差异对象数组
   *
   * 该函数调用 `_local.makeDifferents()` 方法获取差异数据，
   * 然后从每个差异对象中提取 `delta` 属性，最终返回这些 `delta` 组成的数组。
   *
   * @returns 返回包含数据差异对象的数组
   */
  function makeDifferents(): Vars[] {
    let re: Vars[] = [];
    let diffs = _local.makeDifferents();
    for (let diff of diffs) {
      re.push(diff.delta);
    }
    return re;
  }

  /**
   * 生成当前选中项的数据差异对象
   *
   * 该函数会获取当前选中项的本地版本和远程版本数据，
   * 然后对比这两个版本，生成差异对象。
   * 如果当前没有选中项，或者找不到对应的本地或远程数据，
   * 则返回 undefined。
   *
   * @returns 返回当前选中项的数据差异对象，如果没有差异或无选中项则返回 undefined
   */
  function makeCurrentDifferent(): Vars | undefined {
    let currentId = _current_id.value;
    if (_.isNil(currentId)) {
      return undefined;
    }
    // 获取本地和远程两个版本
    let local = _local.localList.value?.find(
      (it, index) => getItemId(it, index) == currentId
    );
    if (!local) {
      return undefined;
    }
    let remote = _remote.value?.find(
      (it, index) => getItemId(it, index) == currentId
    );
    if (!remote) {
      return undefined;
    }

    let diff = Util.buildDifferentItem(local, remote, {
      getId: getItemId,
    });
    return diff?.delta;
  }
  //---------------------------------------------
  // 冲突
  //---------------------------------------------
  /**
   * 异步计算数据冲突项
   *
   * 该方法会从服务器拉取最新数据，然后与本地数据和当前远程数据进行比对，
   * 计算出存在冲突的数据项。
   *
   * @returns 冲突详情
   */
  async function makeConflict(
    options: BuildConflictListOptions
  ): Promise<ListStoreConflicts | undefined> {
    // 首先从服务器拉取数据，然后我们就有了三个数据版本
    let server = await loadRemoteList();
    let local = _local.localList.value;
    let remote = _remote.value;

    // 比对差异
    let myDiff = buildDifferentListItems(local, remote);
    let taDiff = buildDifferentListItems(server, remote);

    // 计算冲突
    let conflicts = buildConflictList(myDiff, taDiff, {
      getId: getItemId,
      ...options,
    });
    return {
      server,
      local,
      remote,
      localDiff: myDiff,
      remoteDiff: taDiff,
      conflicts,
    };
  }

  /**
   * 解决冲突，首先将 server 数据覆盖 remote
   * 然后除了冲突的字段， local 的字段全部用 server 字段替换
   */
  function applyConflicts(cf: ListStoreConflicts) {
    let { server, localDiff } = cf;
    _remote.value = server;
    apply_conflict_list(_local.localList, server, localDiff);
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

  function existsInRemote(id: string): boolean {
    return _local.existsInRemote(id);
  }

  /**
   * 获取数据的 ID
   */
  function getItemId(it: SqlResult, index: number = -1): string {
    return _local.getRowId(it, index) as string;
  }

  function getItemById(id?: string) {
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

  function findItemsById(ids: string[]): SqlResult[] {
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

  function getNextId(): string | undefined {
    return _local.getNextRowId(_checked_ids.value) as string;
  }

  function getFilterField(key: string, dft?: any) {
    return _.get(_query.value.filter, key) ?? dft;
  }

  function prependItem(item: SqlResult) {
    // 如果存在就更新
    let id = getItemId(item);
    let index = getItemIndex(id);
    if (index >= 0) {
      updateItemBy(item, { index });
    }
    // 直接添加到开头
    else {
      _local.prependToList(item);
    }
  }

  function appendItem(item: SqlResult) {
    // 如果存在就更新
    let id = getItemId(item);
    let index = getItemIndex(id);
    if (index >= 0) {
      updateItemBy(item, { index });
    }
    // 直接添加到结尾
    else {
      _local.appendToList(item);
    }
  }

  function prependItems(items: SqlResult[] = []) {
    if (!items) {
      return;
    }
    for (let item of items.reverse()) {
      prependItem(item);
    }
  }

  function appendItems(items: SqlResult[] = []) {
    if (!items) {
      return;
    }
    for (let item of items) {
      appendItem(item);
    }
  }

  function updateCurrent(meta: SqlResult): SqlResult | undefined {
    if (hasCurrent.value) {
      let uf = { id: _current_id.value };
      return _local.updateItem(meta, uf);
    }
  }

  /**
   * 更新项目列表
   *
   * 根据提供的元数据项获取其唯一 ID，并通过本地存储更新相应项目。
   *
   * @param meta - SQL 查询结果元数据数组
   * @returns 返回成功更新的项目数组，如果输入为空则返回空数组
   */
  function updateItem(meta: SqlResult) {
    if (_.isEmpty(meta)) {
      return undefined;
    }
    let id = getItemId(meta);
    if (_.isNil(id)) {
      return undefined;
    }
    return _local.updateItem(meta, { id });
  }

  /**
   * 更新项目列表
   *
   * 根据提供的元数据项获取其唯一 ID，并通过本地存储更新相应项目。
   *
   * @param meta - SQL 查询结果元数据数组
   * @returns 返回成功更新的项目数组，如果输入为空则返回空数组
   */
  function updateItems(meta: SqlResult[]) {
    if (_.isEmpty(meta)) {
      return [];
    }
    let re: SqlResult[] = [];
    for (let m of meta) {
      let id = getItemId(m);
      let item = _local.updateItem(m, { id });
      if (item) {
        re.push(item);
      }
    }
    return re;
  }

  function updateItemBy(
    meta: Vars,
    options: LocalListUpdateItemOptions
  ): SqlResult | undefined {
    return _local.updateItem(meta, options);
  }

  function updateItemsBy(
    meta: SqlResult,
    forIds?: string | string[]
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

      _action_status.value = "deleting";
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

  function setItems(items: SqlResult[]) {
    _local.setItems(items);
  }

  function clear() {
    _local.clearItems();
  }

  function removeItems(forIds?: string | string[]): SqlResult[] {
    if (!_.isNil(forIds)) {
      let ids = _.concat([], forIds);
      return _local.removeLocalItems(ids);
    }

    return [];
  }

  function removeItemsBy(
    filter: (item: SqlResult, index: number) => boolean
  ): SqlResult[] {
    return _local.removeLocalItemsBy(filter);
  }

  //---------------------------------------------
  // 选择方法
  //---------------------------------------------
  async function onSelect(payload: TableSelectEmitInfo) {
    let currentId = (payload.currentId as string) ?? undefined;
    let checkedIds = Util.anyToTruthyKeys(payload.checkedIds);
    await updateSelection(currentId, checkedIds);
    __save_local_select();
  }

  async function selectItem(id?: string | null) {
    if (_.isNil(id)) {
      cancelSelection();
    } else {
      let currentId = id;
      let checkedIds = [id];
      await updateSelection(currentId, checkedIds);
    }
    __save_local_select();
  }

  async function updateSelection(
    currentId?: string | null,
    checkedIds?: string[]
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
    _.assign(_query.value, q);
    __save_local_query();
  }

  function setFilter(filter: QueryFilter) {
    _query.value.filter = Util.jsonClone(filter);
    __save_local_query();
  }

  function setSorter(sorter: QuerySorter) {
    _query.value.sorter = Util.jsonClone(sorter);
    __save_local_query();
  }

  function setPager(page: Partial<SqlPagerInput>) {
    if (!_query.value.pager) {
      _query.value.pager = {
        pageNumber: 1,
        pageSize: 20,
      };
    }
    updatePager(_query.value.pager, page);
    __save_local_query();
  }

  function addLocalItem(meta: SqlResult) {
    _local.appendToList(meta);
  }

  function __gen_query(): SqlQuery {
    let q = Util.jsonClone(_query.value);
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

  /**
   * 异步加载远程列表数据
   *
   * 该方法会将操作状态设置为加载中，准备查询条件并应用查询前缀，
   * 然后调用 SQL 执行查询操作。如果配置了数据修补函数，会对查询结果进行修补，
   * 最后返回查询到的远程列表数据。
   *
   * @returns {Promise<SqlResult[]>} 包含远程列表数据的 Promise
   */
  async function loadRemoteList(): Promise<SqlResult[]> {
    _action_status.value = "loading";
    try {
      // 准备查询条件
      let q = __gen_query();
      apply_query_prefix(q, _query_prefix_append.value);
      // console.log('queryRemoteList', q);
      let list = await sqlx.query(options.sqlQuery, q);
      if (options.patchRemote) {
        let list2 = [] as SqlResult[];
        for (let i = 0; i < list.length; i++) {
          let li = list[i];
          let li2 = options.patchRemote(li, i);
          if (li2) {
            list2.push(li2);
          }
        }
        list = list2;
      }
      return list;
    } finally {
      _action_status.value = undefined;
    }
  }

  /**
   * 异步查询远程列表数据
   *
   * 该方法会将操作状态设置为加载中，准备查询条件并应用查询前缀，
   * 然后调用 SQL 执行查询操作。如果配置了数据修补函数，会对查询结果进行修补，
   * 最后将查询结果赋值给远程数据引用，并将操作状态重置。
   *
   * @returns {Promise<void>} 无返回值
   */
  async function queryRemoteList(): Promise<void> {
    _remote.value = await loadRemoteList();
  }
  //---------------------------------------------
  async function countRemoteList() {
    // 防空
    if (!options.sqlCount) {
      return;
    }
    _action_status.value = "loading";
    let q = __gen_query();
    apply_query_prefix(q, _count_prefix_append.value);
    let total = await countRemote(q.filter);
    if (_query.value.pager) {
      updatePagerTotal(_query.value.pager, total);
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
    dropChange();
    //remoteList.value = undefined;
    await Promise.all([queryRemoteList(), countRemoteList()]);
  }
  //---------------------------------------------
  /**
   * 刷新函数，根据提供的选项执行刷新操作。
   */
  async function refresh(options: RefreshOptions = {}) {
    if (options.reset) {
      dropChange();
    }
    await Promise.all([queryRemoteList(), countRemoteList()]);
  }
  //---------------------------------------------
  //               远程更新方法
  //---------------------------------------------
  async function saveChange(setup: Vars = {}) {
    const { transLevel = 1 } = setup;
    // 获取改动信息
    let changes = makeChanges();
    if (debug) console.log("saveChange", changes);
    // 保护一下
    if (changes.length == 0) {
      return;
    }
    //console.log('changes', changes);
    // 执行更新
    _action_status.value = "saving";
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
    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    query: computed(() => _query.value),
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
    Pager,
    Filter,
    Sorter,
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
    getNextId,
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    resetLocalAndRemote,
    dropChange,
    clearRemoteList,
    setRemoteList,

    setQuery,
    setFilter,
    setSorter,
    setPager,

    addLocalItem,
    setActionStatus(st?: DataStoreActionStatus | null) {
      _action_status.value = st || undefined;
    },

    appendItem,
    prependItem,
    appendItems,
    prependItems,

    updateCurrent,
    updateItem,
    updateItems,
    updateItemBy,
    updateItemsBy,
    updateChecked,

    removeChecked,
    removeItems,
    removeItemsBy,
    setItems,
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
    makeCurrentDifferent,
    makeConflict,
    applyConflicts,
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
