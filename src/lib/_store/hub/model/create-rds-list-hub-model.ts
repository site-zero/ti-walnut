import { Vars } from '@site0/tijs';
import {
  GlobalStatusApi,
  RdsListStoreOptions,
  useRdsListStore,
} from '../../../../..';
import { HubModel } from '../hub-view-types';
import { useModelOptionGetter } from './use-model-option-getter';

export function createRdsListHubModel(
  _gb_sta: GlobalStatusApi,
  options: Vars,
  objId?: string
): HubModel {
  // const storeOptions = _.assign(
  //   { query: { filter: {} } },
  //   options
  // ) as RdsListStoreOptions;

  const _opt = useModelOptionGetter(options);

  const storeOptions: RdsListStoreOptions = {
    globalStatus: _gb_sta,
    daoName: _opt.getString('daoName'),
    keepQuery: _opt.getKeepInfo('keepQuery'),
    keepSelect: _opt.getKeepInfo('keepSelect'),
    fixedMatch: _opt.getQueryFilter('fixedMatch'),
    defaultFilter: _opt.getQueryFilter('defaultFilter'),
    query: _opt.getQuery('query'),
    sqlQuery: _opt.getString('sqlQuery') ?? '-sqlQuery unset-',
    sqlCount: _opt.getString('sqlCount') ?? '-sqlCount unset-',
    queryPrefix: _opt.getRdsQueryPrefixSetup('queryPrefix'),
    countPrefix: _opt.getRdsQueryPrefixSetup('countPrefix'),
    makeChange: {
      // LocalListMakeChangeOptions
      deleteSql: _opt.getString('makeChange.deleteSql'),

      // LocalMetaMakeDiffOptions
      defaultMeta: _opt.getLocalMetaPatcher('makeChange.defaultMeta'),
      insertMeta: _opt.getLocalMetaPatcher('makeChange.insertMeta'),
      updateMeta: _opt.getLocalUpdateMetaPatcher('makeChange.updateMeta'),

      // LocalMetaMakeChangeOptions
      updateSql: _opt.getString('makeChange.updateSql') ?? '-updateSql unset-',
      insertSql: _opt.getString('makeChange.insertSql') ?? '-insertSql unset-',
      insertSet: _opt.getSqlExecSetVarArrayGetter('makeChange.insertSet'),
      insertPut: _opt.getString('makeChange.insertPut'),
      updatePut: _opt.getString('makeChange.updatePut'),
      fetchBack: _opt.getSqlExecFetchBackGetter('makeChange.fetchBack'),
      noresult: _opt.getBoolean('makeChange.noresult'),
    },
    refreshWhenSave: _opt.getBoolean('refreshWhenSave'),
    patchRemote: _opt.getFunction('patchRemote'),
  };

  const store = useRdsListStore(storeOptions);
  const createGUIContext = () => {
    let _s = store;
    return {
      currentId: _s.currentId.value,
      checkedIds: _s.checkedIds.value,
      query: _s.query,
      ActionStatus: _s.ActionStatus.value,
      ActionBarVars: _s.ActionBarVars.value,
      LoadStatus: _s.LoadStatus.value,
      listData: _s.listData.value,
      hasCurrent: _s.hasCurrent.value,
      hasChecked: _s.hasChecked.value,
      changed: _s.changed.value,
      isEmpty: _s.isEmpty.value,
      isRemoteEmpty: _s.isRemoteEmpty.value,
      isLocalEmpty: _s.isLocalEmpty.value,
      CurrentItem: _s.CurrentItem.value,
    };
  };

  async function reload() {
    await store.reload();
    if (objId) {
      store.updateSelection(objId);
      _gb_sta.data.selectedRows = 1;
      _gb_sta.data.currentObj = store.CurrentItem.value;
    }
  }

  async function refresh() {
    await store.queryRemoteList();
  }

  return {
    modelType: 'RDS-LIST',
    store,
    createGUIContext,
    getActionBarVars: () => store.ActionBarVars.value,
    reload,
    refresh,
  };
}
