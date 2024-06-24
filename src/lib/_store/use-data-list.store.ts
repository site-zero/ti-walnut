import {
  ComboFilterValue,
  KeepInfo,
  TableRowID,
  TableSelectEmitInfo,
  Util,
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

export type DataListStoreStatus = 'loading' | 'saving';

export type DataListStoreFeature = {
  //---------------------------------------------
  // 数据模型
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
  //---------------------------------------------
  // Getter
  isChanged: () => boolean;
  getItemId: (it: SqlResult, index: number) => TableRowID;
  getItemById: (id: TableRowID) => SqlResult | undefined;
  getCurrentItem: () => SqlResult | undefined;
  getFilterField: (key: string, dft?: any) => any;
  //---------------------------------------------
  // 本地方法
  resetLocal: () => void;
  updateQuery: (query: ComboFilterValue) => void;
  updateFilter: (filter: QueryFilter) => void;
  updateSorter: (sorter: QuerySorter) => void;
  updatePager: (page: Partial<SqlPagerInput>) => void;
  addLocalItem: (meta: SqlResult) => void;
  updateCurrent: (meta: SqlResult) => void;
  removeChecked: () => void;
  updateSelection: (currentId: TableRowID, checkedIds?: TableRowID[]) => void;
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
  keepQuery: KeepInfo;
  query: SqlQuery;
  sqlQuery: string;
  sqlCount: string;
  makeChange: LocalListMakeChangeOptions;
  refreshWhenSave?: boolean;
  patchRemote?: (remote: SqlResult, index: number) => SqlResult;
};

function defineDataListStore(
  options: DataListStoreOptions
): DataListStoreFeature {
  //---------------------------------------------
  // 准备数据访问模型
  let sqlx = useSqlx();
  //---------------------------------------------
  // 本地保存
  let Keep = useKeep(options.keepQuery);
  //---------------------------------------------
  //              默认查询条件
  //---------------------------------------------
  let _dft_query = _.defaults(options.query, {
    filter: {},
    sorter: {
      ct: 1,
    },
  });
  let _query = Keep.loadObj(_dft_query) as SqlQuery;
  _query.pager = _.pick(_query.pager, 'pageSize') as SqlPager;
  _.defaults(_query.pager, {
    pageNumber: 1,
    pageSize: options.query.pager?.pageSize ?? 50,
  });
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const remoteList = ref<SqlResult[]>();
  const status = ref<DataListStoreStatus>();
  const query = reactive(_query as SqlQuery);
  const _current_id = ref<TableRowID>();
  const _checked_ids = ref<TableRowID[]>([]);

  function __save_local_query() {
    Keep.save({
      filter: query.filter,
      sorter: query.sorter,
      pager: {
        pageSize: query.pager.pageSize,
      },
    });
  }
  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = computed(() => useLocalListEdit(remoteList, options));

  function resetLocal() {
    _local.value.reset();
    _current_id.value = undefined;
    _checked_ids.value = [];
  }
  //---------------------------------------------
  //                 被内部重用的方法
  //---------------------------------------------
  const listData = computed(() => {
    console.log(
      'computed listData',
      _local.value.localList.value,
      remoteList.value
    );
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
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
    isChanged: () => _local.value.isChanged(),
    getItemId,
    getItemById,
    getCurrentItem,
    getFilterField: (key: string, dft?: any) => {
      return _.get(query.filter, key) ?? dft;
    },
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    resetLocal,

    updateQuery(q: ComboFilterValue) {
      _.assign(query, q);
      __save_local_query();
    },

    updateFilter(filter: QueryFilter) {
      query.filter = _.cloneDeep(filter);
      __save_local_query();
    },

    updateSorter(sorter: QuerySorter) {
      query.sorter = _.cloneDeep(sorter);
      __save_local_query();
    },

    updatePager(page: Partial<SqlPagerInput>) {
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

    updateSelection(currentId: TableRowID, checkedIds?: TableRowID[]) {
      checkedIds = checkedIds ?? [currentId];
      _current_id.value = currentId;
      _checked_ids.value = checkedIds;
    },

    //---------------------------------------------
    //                  与控件绑定
    //---------------------------------------------
    onSelect(payload: TableSelectEmitInfo) {
      _current_id.value = payload.currentId ?? undefined;
      _checked_ids.value = Util.mapTruthyKeys(payload.checkedIds);
    },

    //---------------------------------------------
    //                  远程方法
    //---------------------------------------------
    countRemoteList,
    queryRemoteList,

    saveChange: async (): Promise<void> => {
      let changes = [] as SqlExecOptions[];
      changes.push(..._local.value.makeChanges(options.makeChange));
      //console.log('changes', changes);
      // 最后执行更新
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
      resetLocal();
      //remoteList.value = undefined;
      await Promise.all([queryRemoteList(), countRemoteList()]);
    },
  };
}

/**
 * 维持全局单例
 */
const _stores = new Map<string, DataListStoreFeature>();

export function useDataListStore(
  _name: string,
  options: DataListStoreOptions
): DataListStoreFeature {
  // let re = _stores.get(name);
  // if (!re) {
  //   re = defineDataListStore(options);
  //   _stores.set(name, re);
  // }
  // return re;
  return defineDataListStore(options);
}
