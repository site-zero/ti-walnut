import {
  ComboFilterValue,
  TableRowID,
  TableSelectEmitInfo,
  Util,
} from '@site0/tijs';
import _ from 'lodash';
import { ComputedRef, Ref, computed, reactive, ref } from 'vue';
import {
  LocalListEditOptions,
  LocalListMakeChangeOptions,
  SqlExecOptions,
  SqlQuery,
  SqlResult,
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
  getFilterField: (key: string, dft?: any) => any;
  //---------------------------------------------
  // 本地方法
  resetLocal: () => void;
  updateQuery: (query: ComboFilterValue) => void;
  addLocalItem: (meta: SqlResult) => void;
  updateCurrent: (meta: SqlResult) => void;
  removeChecked: () => void;
  //---------------------------------------------
  // 与控件绑定
  onSelect: (payload: TableSelectEmitInfo) => void;
  //---------------------------------------------
  //  远程方法
  queryRemoteList: () => Promise<void>;
  saveChange: () => Promise<void>;
  reload: () => Promise<void>;
  //---------------------------------------------
};

export type DataStoreOptions = LocalListEditOptions & {
  query: SqlQuery;
  sqlQuery: string;
  makeChange: LocalListMakeChangeOptions;
};

function defineDataListStore(options: DataStoreOptions): DataListStoreFeature {
  // 准备数据访问模型
  let sqlx = useSqlx();
  //---------------------------------------------
  //              默认查询条件
  //---------------------------------------------
  let _query = _.defaults(options.query, {
    filter: {},
    sorter: {
      ct: 1,
    },
    pager: {
      pageNumber: 1,
      pageSize: 50,
    },
  });
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const remoteList = ref<SqlResult[]>();
  const status = ref<DataListStoreStatus>();
  const query = reactive(_query);
  const _current_id = ref<TableRowID>();
  const _checked_ids = ref<TableRowID[]>([]);

  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = computed(() => useLocalListEdit(remoteList, options));

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
    console.log('getItemById', id);
    if (_.isNil(id)) {
      return;
    }
    return _.find(listData.value, (li, index) => getItemId(li, index) == id);
  }

  async function queryRemoteList(): Promise<void> {
    status.value = 'loading';
    remoteList.value = await sqlx.select(options.sqlQuery, query);
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
    getFilterField: (key: string, dft?: any) => {
      return _.get(query.filter, key) ?? dft;
    },
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    resetLocal() {
      _local.value.reset();
    },

    updateQuery(q: ComboFilterValue) {
      _.assign(query, q);
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
    queryRemoteList,

    saveChange: async (): Promise<void> => {
      let changes = [] as SqlExecOptions[];
      changes.push(..._local.value.makeChanges(options.makeChange));
      console.log('changes', changes);
      // 最后执行更新
      await sqlx.exec(changes);
    },

    reload: async (): Promise<void> => {
      _local.value.reset();
      remoteList.value = undefined;
      await queryRemoteList();
    },
  };
}

/**
 * 维持全局单例
 */
const _stores = new Map<string, DataListStoreFeature>();

export function useDataListStore(
  name: string,
  options: DataStoreOptions
): DataListStoreFeature {
  let re = _stores.get(name);
  if (!re) {
    re = defineDataListStore(options);
    _stores.set(name, re);
  }
  return re;
}
