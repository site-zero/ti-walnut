import { Vars } from '@site0/tijs';
import _ from 'lodash';
import { Ref, reactive, ref } from 'vue';
import {
  QueryFilter,
  QuerySorter,
  SqlExecOptions,
  SqlPager,
  SqlQuery,
  SqlResult,
  StoreStatus,
  useSqlx,
} from '../';

export type RdsStoreFeature = {
  storeName: string;
  status: StoreStatus;
  query: SqlQuery;
  remoteList: Ref<SqlResult[]>;
  queryRemoteList: (sqlName: string) => Promise<void>;
  createRemote: (
    sqlName: string,
    vars: Vars,
    options?: SqlExecOptions
  ) => Promise<any>;
};

export type RdsStoreDefination = {
  daoName?: string;
  storeName: string;
  filter?: QueryFilter;
  sorter?: QuerySorter;
  pager?: SqlPager;
};

export function defineRdsSimpleStore(
  options: RdsStoreDefination
): RdsStoreFeature {
  let sqlx = useSqlx(options.daoName);
  let remoteList = ref<SqlResult[]>([]);
  let status = reactive({
    loading: false,
    saving: false,
    removing: false,
    processing: false,
    changed: false,
  } as StoreStatus);
  let query = reactive({
    filter: _.cloneDeep(options.filter || {}),
    sorter: _.cloneDeep(options.sorter),
    pager: _.assign(
      {
        pageNumber: 1,
        pageSize: 50,
      },
      options.pager
    ),
  } as SqlQuery);

  async function queryRemoteList(sqlName: string) {
    status.loading = true;
    remoteList.value = await sqlx.select(sqlName, query);
    status.loading = false;
  }

  async function createRemote(
    sqlName: string,
    vars: Vars,
    options: SqlExecOptions = {}
  ) {
    return await sqlx.exec(sqlName, vars, options);
  }

  //-------------< Output Feature >------------------
  return {
    storeName: options.storeName,
    status,
    query,
    remoteList,
    queryRemoteList,
    createRemote,
  };
}

const _stores = new Map<string, RdsStoreFeature>();

export function clearRdsSimpleStore(storeName?: string) {
  if (storeName) {
    _stores.delete(storeName);
  } else {
    _stores.clear();
  }
}

export function useRdsSimpleStore(options: RdsStoreDefination) {
  let store = _stores.get(options.storeName);
  if (!store) {
    store = defineRdsSimpleStore(options);
    _stores.set(options.storeName, store);
  }
  return store;
}
