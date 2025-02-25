import { Vars } from '@site0/tijs';
import _ from 'lodash';
import { computed, reactive, ref } from 'vue';
import {
  DataStoreActionStatus,
  QueryFilter,
  QuerySorter,
  SqlPager,
  SqlQuery,
  SqlResult,
  useSqlx,
} from '../../';

export type RdsStoreFeature = ReturnType<typeof defineRdsSimpleStore>;

export type RdsStoreDefination = {
  daoName?: string;
  storeName: string;
  filter?: QueryFilter;
  sorter?: QuerySorter;
  pager?: SqlPager;
};

export function defineRdsSimpleStore(options: RdsStoreDefination) {
  const sqlx = useSqlx(options.daoName);
  //---------------------------------------------
  const _remote_list = ref<SqlResult[]>([]);
  const _action_status = ref<DataStoreActionStatus>();
  //---------------------------------------------
  const ActionStatus = computed(() => _action_status.value);
  //---------------------------------------------
  const ActionBarVars = computed(() => {
    return {
      loading: _action_status.value == 'loading',
      saving: _action_status.value == 'saving',
    } as Vars;
  });
  //---------------------------------------------
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
  //---------------------------------------------
  async function queryRemoteList(sqlName: string) {
    _action_status.value = 'loading';
    _remote_list.value = await sqlx.query(sqlName, query);
    _action_status.value = undefined;
  }

  //-------------< Output Feature >------------------
  return {
    storeName: options.storeName,
    query,
    remoteList: computed(() => _remote_list.value),
    ActionStatus,
    ActionBarVars,
    queryRemoteList,
  };
}

export function useRdsSimpleStore(options: RdsStoreDefination) {
  return defineRdsSimpleStore(options);
}
