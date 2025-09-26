import {
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
  QueryFilter,
  SqlQuery,
  SqlResult,
  updatePagerTotal,
  useSqlx,
} from '../../';
import {
  RdsQueryPrefixAppender,
  RedQueryPrefixSetup,
} from './use-rds-list.store';

export type RdsSimpleStoreApi = ReturnType<typeof defineRdsSimpleStore>;

export type RdsStoreDefination = {
  daoName?: string;
  keepQuery?: KeepInfo;
  keepSelect?: KeepInfo;
  fixedMatch?: QueryFilter | (() => QueryFilter);
  defaultFilter?: QueryFilter | (() => QueryFilter);
  query: SqlQuery | (() => SqlQuery);
  sqlQuery: string;
  sqlCount: string;
  queryPrefix?: RedQueryPrefixSetup;
  countPrefix?: RedQueryPrefixSetup;
  getId?: string | ((it: SqlResult, index: number) => TableRowID);
  /**
   * 可选全局状态接口，如果指定，则在 Select 等时机会自动更新状态
   */
  globalStatus?: GlobalStatusApi;
};

export function defineRdsSimpleStore(options: RdsStoreDefination) {
  let { getId = 'id' } = options;
  //---------------------------------------------
  // 准备数据访问模型
  const sqlx = useSqlx(options.daoName);
  //---------------------------------------------
  // 本地保存
  let _keep_query = useKeep(options.keepQuery);
  let _keep_select = useKeep(options.keepSelect);
  //---------------------------------------------
  //              固定查询条件
  //---------------------------------------------
  function __create_fixed_match(): QueryFilter {
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
  const _remote = ref<SqlResult[]>([]);
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
  const isEmpty = computed(() => _.isEmpty(_remote.value));
  //---------------------------------------------
  const hasCurrent = computed(() => !_.isNil(_current_id.value));
  const hasChecked = computed(
    () => _checked_ids.value && _checked_ids.value.length > 0
  );
  //---------------------------------------------
  const ActionStatus = computed(() => _action_status.value);
  //---------------------------------------------
  const ActionBarVars = computed(() => {
    return {
      loading: _action_status.value == 'loading',
      saving: _action_status.value == 'saving',
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
  const _id_index_map = computed(() => {
    let list = _remote.value || [];
    let re = new Map<TableRowID, number>();
    for (let i = 0; i < list.length; i++) {
      let li = list[i];
      let id = getItemId(li, i);
      if (id) {
        re.set(id, i);
      }
    }
    return re;
  });
  //---------------------------------------------
  // 获取方法
  //---------------------------------------------
  /**
   * 获取数据的 ID
   */
  function getItemId(
    it: SqlResult,
    index: number = -1
  ): TableRowID | undefined {
    if (_.isString(getId)) {
      return _.get(it, getId) ?? `row-${index}`;
    }
    return getId(it, index) ?? `row-${index}`;
  }
  //---------------------------------------------
  function getItemById(id?: TableRowID) {
    if (_.isNil(id) || !_remote.value) {
      return;
    }
    let index = getItemIndex(id);
    if (index >= 0) {
      return _remote.value[index];
    }
  }
  //---------------------------------------------
  function getItemIndex(id: TableRowID) {
    return _id_index_map.value?.get(id) ?? -1;
  }
  //---------------------------------------------
  function getItemByIndex(index: number) {
    if (index >= 0 && index < _remote.value.length) {
      return _remote.value[index];
    }
  }
  //---------------------------------------------
  function getItemByMatch(match: any): SqlResult | undefined {
    let am = Match.parse(match, false);
    for (let i = 0; i < _remote.value.length; i++) {
      let it = _remote.value[i];
      if (am.test(it)) {
        return it;
      }
    }
  }
  //---------------------------------------------
  function getItemBy(predicate: (it: SqlResult, index: number) => boolean) {
    return _.find(_remote.value, predicate);
  }
  //---------------------------------------------
  function getCurrentItem(): SqlResult | undefined {
    return getItemById(_current_id.value);
  }
  //---------------------------------------------
  function getCheckedItems(): SqlResult[] {
    return findItemsById(_checked_ids.value);
  }
  //---------------------------------------------
  function findItemsById(ids: TableRowID[]): SqlResult[] {
    let indexs = ids.map((id) => getItemIndex(id));
    let re: SqlResult[] = [];
    for (let i of indexs) {
      if (i >= 0) {
        let it = _remote.value[i];
        re.push(it);
      }
    }
    return re;
  }
  //---------------------------------------------
  function findItemsByMatch(match: any): SqlResult[] {
    let re: SqlResult[] = [];
    let am = Match.parse(match, false);
    for (let i = 0; i < _remote.value.length; i++) {
      let it = _remote.value[i];
      if (am.test(it)) {
        re.push(it);
      }
    }
    return re;
  }
  //---------------------------------------------
  function findItemsBy(
    predicate: (it: SqlResult, index: number) => boolean
  ): SqlResult[] {
    let re: SqlResult[] = [];
    for (let i = 0; i < _remote.value.length; i++) {
      let it = _remote.value[i];
      if (predicate(it, i)) {
        re.push(it);
      }
    }
    return re;
  }
  //---------------------------------------------
  function getFilterField(key: string, dft?: any) {
    return _.get(query.filter, key) ?? dft;
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
  //---------------------------------------------
  const CurrentItem = computed(() => getCurrentItem());
  //---------------------------------------------
  // 查询方法
  //---------------------------------------------
  function __gen_query(): SqlQuery {
    let q = Util.jsonClone(query);
    q.filter = q.filter ?? {};
    _.assign(q.filter, __create_fixed_match());
    q.filter = Util.filterRecordNilValueDeeply(q.filter);
    if (_.isEmpty(q.filter)) {
      q.filter = __create_default_filter();
    }
    return q;
  }
  //---------------------------------------------
  async function queryRemoteList() {
    _action_status.value = 'loading';
    // 准备查询条件
    let q = __gen_query();
    apply_query_prefix(q, _query_prefix_append.value);
    //console.log('queryRemoteList', q);
    let list = await sqlx.query(options.sqlQuery, q);
    _remote.value = list ?? [];
    _action_status.value = undefined;
  }
  //---------------------------------------------
  async function countRemoteList() {
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
    let total = await sqlx.count(options.sqlCount, filter);
    return total;
  }
  //---------------------------------------------
  /**
   * 刷新函数，根据提供的选项执行刷新操作。
   */
  async function refresh() {
    await Promise.all([queryRemoteList(), countRemoteList()]);
  }
  //---------------------------------------------
  //  输出特性
  //---------------------------------------------
  return {
    // 数据模型
    _keep_query,
    _keep_select,
    _remote,
    currentId: _current_id,
    checkedIds: _checked_ids,
    query,
    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    listData: computed(() => _remote.value),
    ActionStatus,
    ActionBarVars,
    LoadStatus,
    hasCurrent,
    hasChecked,
    isEmpty,
    CurrentItem,
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
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
    countRemoteList,
    countRemote,
    queryRemoteList,
    refresh,
  };
}

export function useRdsSimpleStore(options: RdsStoreDefination) {
  return defineRdsSimpleStore(options);
}
