import { Vars } from '@site0/tijs';
import _ from 'lodash';
import {
  HubModelCreateSetup,
  RdsListStoreOptions,
  useRdsListStore,
} from '../../../../..';
import { HubModel } from '../hub-view-types';
import { useModelOptionGetter } from './use-model-option-getter';

export function createRdsListHubModel(setup: HubModelCreateSetup): HubModel {
  let { global: _gb_sta, modelOptions, objId } = setup;
  if (_.isEmpty(modelOptions)) {
    throw new Error('RDS-LIST modelOptions is empty!');
  }

  const _opt = useModelOptionGetter(modelOptions);

  const storeOptions: RdsListStoreOptions = {
    // 基本信息
    daoName: _opt.getString('daoName'),
    keepQuery: _opt.getKeepInfo('keepQuery'),
    keepSelect: _opt.getKeepInfo('keepSelect'),
    fixedMatch: _opt.getQueryFilter('fixedMatch'),
    defaultFilter: _opt.getQueryFilter('defaultFilter'),

    // 查询
    query: _opt.getQuery('query'),
    sqlQuery: _opt.getString('sqlQuery') ?? '-sqlQuery unset-',
    sqlCount: _opt.getString('sqlCount') ?? '-sqlCount unset-',
    queryPrefix: _opt.getRdsQueryPrefixSetup('queryPrefix'),
    countPrefix: _opt.getRdsQueryPrefixSetup('countPrefix'),

    // 如何获取改动
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

    // 补充选项
    refreshWhenSave: _opt.getBoolean('refreshWhenSave'),
    patchRemote: _opt.getFunction('patchRemote'),

    // 创建
    newItemVars: _opt.getVars('newItemVars'),
    newItem: _opt.getVars('newItem'),

    // 全局状态
    globalStatus: _gb_sta,
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
    }
  }

  async function refresh() {
    await store.queryRemoteList();
  }

  function getChanges(): Vars[] {
    return store.makeDifferents();
  }

  return {
    modelType: 'RDS-LIST',
    store,
    createGUIContext,
    getActionBarVars: () => store.ActionBarVars.value,
    reload,
    refresh,
    getChanges,
  };
}
