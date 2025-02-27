import { Vars } from '@site0/tijs';
import _ from 'lodash';
import { RdsListStoreOptions, useRdsListStore } from '../../../../..';
import { HubModel } from '../hub-view-types';

export function createRdsListHubModel(options: Vars, objId?: string): HubModel {
  const storeOptions = _.assign(
    { query: { filter: {} } },
    options
  ) as RdsListStoreOptions;

  const store = useRdsListStore(storeOptions);
  const createGUIContext = () => {
    let _s = store;
    return {
      currentId: _s.currentId.value,
      checkedIds: _s.checkedIds.value,
      query: _s.query,
      ActionStatus: _s.ActionStatus.value,
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

  return {
    store,
    createGUIContext,
    getActionBarVars: () => store.ActionBarVars.value,
    reload,
    refresh,
  };
}
