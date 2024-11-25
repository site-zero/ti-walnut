import {
  ComboFilterValue,
  getLogger,
  KeepInfo,
  Match,
  TableRowID,
  TableSelectEmitInfo,
  useKeep,
  Util,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { computed, reactive, ref } from 'vue';
import {
  DataStoreActionStatus,
  DataStoreLoadStatus,
  LocalListEditOptions,
  QueryFilter,
  QuerySorter,
  SqlPagerInput,
  SqlQuery,
  updatelPager,
  updatePagerTotal,
  useLocalListEdit,
  useWnObj,
  WnObj,
  WnObjQueryOptions,
} from '../../';

const log = getLogger('wn.use-data-list-store');

export type StdListStore = ReturnType<typeof defineStdListStore>;

export type StdListStoreOptions = LocalListEditOptions & {
  /**
   * 主目录路径，通常就是一个文件夹，如果是 thing 文件夹，
   * 那么，除了生米这个参数，还需要声明 indexPath='index'
   */
  homePath: string;
  /**
   * 数据对象存储的位置，如果未指定，则采用与 homePath 相同的路径
   */
  indexPath?: string;
  /**
   * 指定一个本数据集，专有的数据附件存储目录
   * 如果指定了，那么会根据这个路径也暴露出一个 `StdListStore`
   */
  dataPath?: string;
  /**
   * 本地状态保持的配置
   */
  keepQuery?: KeepInfo;
  keepSelect?: KeepInfo;
  /**
   * 固定过滤条件
   */
  fixedMatch?: QueryFilter | (() => QueryFilter);
  /**
   * 默认查询条件
   */
  query: SqlQuery | (() => SqlQuery);
  /**
   * 保存后自动刷新结果
   */
  refreshWhenSave?: boolean;
  /**
   * 读取 remote 列表后，固定的修改补充信息逻辑
   *
   * @param remote 远端查询结果对象
   * @param index 数据下标 (0 base)
   * @returns
   */
  patchRemote?: (remote: WnObj, index: number) => WnObj;
};

function defineStdListStore(options: StdListStoreOptions) {
  //---------------------------------------------
  // 准备数据访问模型
  const _obj = useWnObj();
  const _home_obj = ref<WnObj>();
  const _dir_index = ref<WnObj>();
  const _dir_data = ref<WnObj>();
  //---------------------------------------------
  // 本地状态数据
  const _keep_query = useKeep(options.keepQuery);
  const _keep_select = useKeep(options.keepSelect);
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
    _.merge(re, local);
    // 搞定
    return re;
  }
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const remoteList = ref<WnObj[]>();
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
  function getItemId(it: WnObj, index: number): TableRowID {
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

  function getItemByMatch(match: any): WnObj | undefined {
    let am = Match.parse(match, false);
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (am.test(it)) {
        return it;
      }
    }
  }

  function getItemBy(predicate: (it: WnObj, index: number) => boolean) {
    return _.find(listData.value, predicate);
  }

  function getCurrentItem(): WnObj | undefined {
    return getItemById(_current_id.value);
  }

  function findItemsById(ids: TableRowID[]): WnObj[] {
    let indexs = ids.map((id) => _local.value.getRowIndex(id));
    let re: WnObj[] = [];
    for (let i of indexs) {
      if (i >= 0) {
        let it = listData.value[i];
        re.push(it);
      }
    }
    return re;
  }

  function findItemsByMatch(match: any): WnObj[] {
    let re: WnObj[] = [];
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
    predicate: (it: WnObj, index: number) => boolean
  ): WnObj[] {
    let re: WnObj[] = [];
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (predicate(it, i)) {
        re.push(it);
      }
    }
    return re;
  }

  function updateCurrent(meta: WnObj): WnObj | undefined {
    if (hasCurrent.value) {
      let uf = { id: _current_id.value };
      return _local.value.updateItem(meta, uf);
    }
  }

  function updateItem(
    meta: Vars,
    { index, id } = {} as { index?: number; id?: TableRowID }
  ): WnObj | undefined {
    return _local.value.updateItem(meta, { index, id });
  }

  function updateItems(
    meta: WnObj,
    forIds?: TableRowID | TableRowID[]
  ): WnObj[] {
    return _local.value.batchUpdate(meta, forIds);
  }

  function updateChecked(meta: WnObj): WnObj[] {
    return _local.value.batchUpdate(meta, _checked_ids.value);
  }

  function removeChecked(): WnObj[] {
    if (hasChecked.value) {
      return _local.value.removeLocalItems(_checked_ids.value);
    }
    return [];
  }

  function clear() {
    _local.value.clearItems();
  }

  function removeItems(forIds?: TableRowID | TableRowID[]): WnObj[] {
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
    return q;
  }

  async function queryRemoteList(setup: WnObjQueryOptions = {}): Promise<void> {
    _action_status.value = 'loading';
    // 准备查询条件
    let q = __gen_query();
    //console.log('queryRemoteList', q);
    let [list, pager] = await _obj.query(_dir_index.value ?? {}, setup, q);

    // 后续处理
    if (options.patchRemote) {
      let list2 = [] as WnObj[];
      for (let i = 0; i < list.length; i++) {
        let li = _.cloneDeep(list[i]);
        let li2 = options.patchRemote(li, i);
        if (li2) {
          list2.push(li2);
        }
      }
      list = list2;
    }

    // 更新结果集
    remoteList.value = list ?? [];

    // 更新翻页信息
    if (query.pager) {
      updatelPager(query.pager, pager);
    }

    _action_status.value = undefined;
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

    addLocalItem(meta: WnObj) {
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
    queryRemoteList,

    reload: async (): Promise<void> => {
      resetLocalChange();
      //remoteList.value = undefined;
      await queryRemoteList();
    },
  };
}

/**
 * 维持全局单例
 */
//const _stores = new Map<string, DataListStoreFeature>();

export function useStdListStore(
  options: StdListStoreOptions,
  _name?: string
): StdListStore {
  return defineStdListStore(options);
}
