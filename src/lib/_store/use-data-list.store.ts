import {
  ComboFilterValue,
  KeepFeature,
  KeepInfo,
  TableRowID,
  TableSelectEmitInfo,
  Util,
  getLogger,
  useKeep,
} from '@site0/tijs';
import _ from 'lodash';
import { ComputedRef, Ref, computed, reactive, ref } from 'vue';
import {
  LocalListEditOptions,
  LocalListMakeChangeOptions,
  QueryFilter,
  QuerySorter,
  SqlExecOptions,
  SqlPager,
  SqlPagerInput,
  SqlQuery,
  SqlResult,
  updatePagerTotal,
  useLocalListEdit,
  useSqlx,
} from '../../lib';

const log = getLogger('wn.use-data-list-store');

export type DataListStoreStatus = 'loading' | 'saving';

export type DataListStoreFeature = {
  //---------------------------------------------
  // 数据模型
  _keep_query: KeepFeature;
  _keep_select: KeepFeature;
  _local: any;
  currentId: Ref<TableRowID | undefined>;
  checkedIds: Ref<TableRowID[]>;
  query: SqlQuery;
  status: Ref<DataListStoreStatus | undefined>;
  remoteList: Ref<SqlResult[] | undefined>;
  //---------------------------------------------
  // 计算属性
  listData: ComputedRef<SqlResult[]>;
  hasCurrent: ComputedRef<boolean>;
  hasChecked: ComputedRef<boolean>;
  changed: ComputedRef<boolean>;
  isEmpty: ComputedRef<boolean>;
  isRemoteEmpty: ComputedRef<boolean>;
  isLocalEmpty: ComputedRef<boolean>;
  //---------------------------------------------
  //isChanged: () => boolean;
  getItemId: (it: SqlResult, index: number) => TableRowID;
  getItemById: (id: TableRowID) => SqlResult | undefined;
  getItemBy: (
    predicate: (it: SqlResult, index: number) => boolean
  ) => SqlResult | undefined;
  getCurrentItem: () => SqlResult | undefined;
  getFilterField: (key: string, dft?: any) => any;
  //---------------------------------------------
  // 本地方法
  resetLocalChange: () => void;
  clearRemoteList: () => void;
  setQuery: (query: ComboFilterValue) => void;
  setFilter: (filter: QueryFilter) => void;
  setSorter: (sorter: QuerySorter) => void;
  setPager: (page: Partial<SqlPagerInput>) => void;
  addLocalItem: (meta: SqlResult) => void;
  updateCurrent: (meta: SqlResult) => void;
  removeChecked: () => void;
  updateSelection: (
    currentId?: TableRowID | null,
    checkedIds?: TableRowID[]
  ) => void;
  cancelSelection: () => void;
  makeChanges: () => SqlExecOptions[];
  //---------------------------------------------
  // 本地化存储状态
  saveLocalQuery: () => void;
  resetLocalQuery: () => void;
  saveLocalSelect: () => void;
  resetLocalSelect: () => void;
  //---------------------------------------------
  // 与控件绑定
  onSelect: (payload: TableSelectEmitInfo) => void;
  //---------------------------------------------
  //  远程方法
  countRemoteList: () => Promise<void>;
  queryRemoteList: () => Promise<void>;
  saveChange: () => Promise<void>;
  reload: () => Promise<void>;
  //---------------------------------------------
};

export type DataListStoreOptions = LocalListEditOptions & {
  daoName?: string;
  keepQuery?: KeepInfo;
  keepSelect?: KeepInfo;
  query: SqlQuery | (() => SqlQuery);
  sqlQuery: string;
  sqlCount: string;
  makeChange?: LocalListMakeChangeOptions;
  refreshWhenSave?: boolean;
  patchRemote?: (remote: SqlResult, index: number) => SqlResult;
};

function defineDataListStore(
  options: DataListStoreOptions
): DataListStoreFeature {
  //---------------------------------------------
  // 准备数据访问模型
  let sqlx = useSqlx(options.daoName);
  //---------------------------------------------
  // 本地保存
  let _keep_query = useKeep(options.keepQuery);
  let _keep_select = useKeep(options.keepSelect);
  //---------------------------------------------
  //              默认查询条件
  //---------------------------------------------
  let _dft_query: SqlQuery;
  if (_.isFunction(options.query)) {
    _dft_query = options.query();
  } else {
    _dft_query = _.cloneDeep(options.query);
  }
  _.defaults(_dft_query, {
    filter: {},
    sorter: {
      ct: 1,
    },
  });
  let _query = _keep_query.loadObj(_dft_query) as SqlQuery;
  _query.pager = _.pick(_query.pager, 'pageSize') as SqlPager;
  _.defaults(_query.pager, {
    pageNumber: 1,
    pageSize: _dft_query.pager?.pageSize ?? 50,
  });
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const remoteList = ref<SqlResult[]>();
  const status = ref<DataListStoreStatus>();
  const query = reactive(_query as SqlQuery);
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
        pageSize: query.pager.pageSize,
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

  function resetLocalChange() {
    _local.value.reset();
  }

  function clearRemoteList() {
    remoteList.value = undefined;
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
    // console.log('getItemById', id);
    if (_.isNil(id)) {
      return;
    }
    return _.find(listData.value, (li, index) => getItemId(li, index) == id);
  }

  function getItemBy(predicate: (it: SqlResult, index: number) => boolean) {
    return _.find(listData.value, predicate);
  }

  function getCurrentItem(): SqlResult | undefined {
    return getItemById(_current_id.value);
  }

  async function queryRemoteList(): Promise<void> {
    status.value = 'loading';
    let list = await sqlx.select(options.sqlQuery, query);
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
    status.value = undefined;
  }

  async function countRemoteList() {
    status.value = 'loading';
    let total = await sqlx.count(options.sqlCount, query.filter);
    updatePagerTotal(query.pager, total);
    status.value = undefined;
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
    status,
    remoteList,

    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    listData,
    hasCurrent,
    hasChecked,
    changed: computed(() => _local.value.isChanged()),
    isEmpty: computed(() => _.isEmpty(listData.value)),
    isRemoteEmpty: computed(() => _.isEmpty(remoteList.value)),
    isLocalEmpty: computed(() => _.isEmpty(_local.value?.localList?.value)),
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
    //isChanged: () => _local.value.isChanged(),
    getItemId,
    getItemById,
    getItemBy,
    getCurrentItem,
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
      let { pageNumber, pageSize } = page;
      if (_.isNumber(pageNumber) && pageNumber > 0) {
        query.pager.pageNumber = pageNumber;
      }
      if (_.isNumber(pageSize) && pageSize > 0) {
        query.pager.pageSize = pageSize;
        __save_local_query();
      }
    },

    addLocalItem(meta: SqlResult) {
      _local.value.appendToList(meta);
    },

    updateCurrent(meta: SqlResult) {
      if (hasCurrent.value) {
        _local.value.batchUpdate(meta, _current_id.value);
      }
    },

    removeChecked() {
      if (hasChecked.value) {
        _local.value.removeLocalItems(_checked_ids.value);
      }
    },

    updateSelection(currentId?: TableRowID | null, checkedIds?: TableRowID[]) {
      if (_.isEmpty(checkedIds) && !_.isNil(currentId)) {
        checkedIds = [currentId];
      }
      _current_id.value = currentId ?? undefined;
      _checked_ids.value = checkedIds ?? [];
    },

    cancelSelection() {
      _current_id.value = undefined;
      _checked_ids.value = [];
      __reset_local_select();
    },

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
      await sqlx.exec(changes);

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

export function useDataListStore(
  options: DataListStoreOptions,
  _name?: string
): DataListStoreFeature {
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
  return defineDataListStore(options);
}
