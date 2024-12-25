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
  ListItemUpdateOptions,
  LocalListEditOptions,
  LocalListMakeChangeOptions,
  QueryFilter,
  QuerySorter,
  SqlPagerInput,
  SqlQuery,
  SqlResult,
  updatelPager,
  updatePagerTotal,
  useLocalListEdit,
  useSqlx,
} from '../../';

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

export type RdsListStore = ReturnType<typeof defineRdsListStore>;

export type RdsListStoreOptions = LocalListEditOptions & {
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
  makeChange?: LocalListMakeChangeOptions;
  refreshWhenSave?: boolean;
  patchRemote?: (remote: SqlResult, index: number) => SqlResult;
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
  function __create_fixed_match(): QueryFilter {
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
  const remoteList = ref<SqlResult[]>();
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
    _keep_query.reset();
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
    _keep_select.reset();
  }
  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = computed(() => useLocalListEdit(remoteList, options));
  //---------------------------------------------
  const ActionStatus = computed(() => _action_status.value);
  //---------------------------------------------
  const LoadStatus = computed((): DataStoreLoadStatus => {
    if (_.isUndefined(remoteList.value)) {
      return 'unloaded';
    }
    if (remoteList.value.length == query.pager?.totalCount) {
      return 'full';
    }
    return 'partial';
  });

  //---------------------------------------------
  // 基础本地方法
  //---------------------------------------------
  function resetLocalChange() {
    _local.value.reset();
  }

  function clearRemoteList() {
    remoteList.value = undefined;
    if (query.pager) {
      updatePagerTotal(query.pager, 0);
    }
  }

  function makeChanges() {
    // 保护一下
    if (!options.makeChange) {
      return [];
    }
    return _local.value.makeChanges(options.makeChange);
  }
  //---------------------------------------------
  //                 被内部重用的方法
  //---------------------------------------------
  const listData = computed(() => {
    return _local.value.localList.value || remoteList.value || [];
  });
  const hasCurrent = computed(() => !_.isNil(_current_id.value));
  const hasChecked = computed(
    () => _checked_ids.value && _checked_ids.value.length > 0
  );

  /**
   * 获取数据的 ID
   */
  function getItemId(it: SqlResult, index: number): TableRowID {
    return _local.value.getRowId(it, index);
  }

  function getItemById(id?: TableRowID) {
    if (_.isNil(id)) {
      return;
    }
    let index = _local.value.getRowIndex(id);
    if (index >= 0) {
      return listData.value[index];
    }
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

  function findItemsById(ids: TableRowID[]): SqlResult[] {
    let indexs = ids.map((id) => _local.value.getRowIndex(id));
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

  function updateCurrent(meta: SqlResult): SqlResult | undefined {
    if (hasCurrent.value) {
      let uf = { id: _current_id.value };
      return _local.value.updateItem(meta, uf);
    }
  }

  function updateItem(
    meta: Vars,
    options: ListItemUpdateOptions
  ): SqlResult | undefined {
    return _local.value.updateItem(meta, options);
  }

  function updateItems(
    meta: SqlResult,
    forIds?: TableRowID | TableRowID[]
  ): SqlResult[] {
    return _local.value.batchUpdate(meta, forIds);
  }

  function updateChecked(meta: SqlResult): SqlResult[] {
    return _local.value.batchUpdate(meta, _checked_ids.value);
  }

  function removeChecked(): SqlResult[] {
    if (hasChecked.value) {
      return _local.value.removeLocalItems(_checked_ids.value);
    }
    return [];
  }

  function clear() {
    _local.value.clearItems();
  }

  function removeItems(forIds?: TableRowID | TableRowID[]): SqlResult[] {
    if (!_.isNil(forIds)) {
      let ids = _.concat([], forIds);
      return _local.value.removeLocalItems(ids);
    }

    return [];
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
  }

  function cancelSelection() {
    _current_id.value = undefined;
    _checked_ids.value = [];
    __reset_local_select();
  }

  const CurrentItem = computed(() => getCurrentItem());

  function __gen_query(): SqlQuery {
    let q = _.cloneDeep(query);
    q.filter = q.filter ?? {};
    _.assign(q.filter, __create_fixed_match());
    if (_.isEmpty(q.filter)) {
      q.filter = __create_default_filter();
    }
    return q;
  }

  async function queryRemoteList(): Promise<void> {
    _action_status.value = 'loading';
    // 准备查询条件
    let q = __gen_query();
    apply_query_prefix(q, _query_prefix_append.value);
    console.log('queryRemoteList', q);
    let list = await sqlx.select(options.sqlQuery, q);
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
    remoteList.value = list ?? [];
    _action_status.value = undefined;
  }

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

  async function countRemote(filter: Vars | Vars[]): Promise<number> {
    let total = await sqlx.count(options.sqlCount, filter);
    return total;
  }
  /*---------------------------------------------
                    
                  输出特性
  
  ---------------------------------------------*/
  return {
    // 数据模型
    _keep_query,
    _keep_select,
    _local,
    currentId: _current_id,
    checkedIds: _checked_ids,
    query,
    status: _action_status,
    remoteList,

    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    ActionStatus,
    LoadStatus,
    listData,
    hasCurrent,
    hasChecked,
    changed: computed(() => _local.value.isChanged()),
    isEmpty: computed(() => _.isEmpty(listData.value)),
    isRemoteEmpty: computed(() => _.isEmpty(remoteList.value)),
    isLocalEmpty: computed(() => _.isEmpty(_local.value?.localList?.value)),
    CurrentItem,
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
    //isChanged: () => _local.value.isChanged(),
    getItemId,
    getItemById,
    getItemByIndex,
    getItemByMatch,
    getItemBy,
    getCurrentItem,
    findItemsById,
    findItemsByMatch,
    findItemsBy,
    getFilterField: (key: string, dft?: any) => {
      return _.get(query.filter, key) ?? dft;
    },
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    resetLocalChange,
    clearRemoteList,

    setQuery(q: ComboFilterValue) {
      _.assign(query, q);
      __save_local_query();
    },

    setFilter(filter: QueryFilter) {
      query.filter = _.cloneDeep(filter);
      __save_local_query();
    },

    setSorter(sorter: QuerySorter) {
      query.sorter = _.cloneDeep(sorter);
      __save_local_query();
    },

    setPager(page: Partial<SqlPagerInput>) {
      if (!query.pager) {
        query.pager = {
          pageNumber: 1,
          pageSize: 20,
        };
      }
      updatelPager(query.pager, page);
      __save_local_query();
    },

    addLocalItem(meta: SqlResult) {
      _local.value.appendToList(meta);
    },

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
    onSelect(payload: TableSelectEmitInfo) {
      _current_id.value = payload.currentId ?? undefined;
      _checked_ids.value = Util.mapTruthyKeys(payload.checkedIds);
      __save_local_select();
    },

    //---------------------------------------------
    //                  远程方法
    //---------------------------------------------
    countRemoteList,
    countRemote,
    queryRemoteList,
    makeChanges,
    saveChange: async (): Promise<void> => {
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
      await sqlx.exec(changes);
      _action_status.value = undefined;

      // 更新远程结果
      if (options.refreshWhenSave) {
        queryRemoteList().then(() => {
          //强制取消本地改动
          _local.value.reset();
        });
      }
    },

    reload: async (): Promise<void> => {
      resetLocalChange();
      //remoteList.value = undefined;
      await Promise.all([queryRemoteList(), countRemoteList()]);
    },
  };
}

/**
 * 维持全局单例
 */
//const _stores = new Map<string, DataListStoreFeature>();

export function useRdsListStore(
  options: RdsListStoreOptions,
  _name?: string
): RdsListStore {
  // 强制创建新的
  // if ('NEW' == name || Str.isBlank(name)) {
  //   return defineDataListStore(options);
  // }
  // // 持久化的实例
  // let re = _stores.get(name);
  // if (!re) {
  //   re = defineDataListStore(options);
  //   _stores.set(name, re);
  // }
  // return re;
  return defineRdsListStore(options);
}
