import { Vars } from '@site0/tijs';
import _ from 'lodash';
import { Walnut } from '../../../../core';
import {
  StdListStoreOptions,
  useStdListStore,
} from '../../std/use-std-list.store';
import { HubModel } from '../hub-view-types';

export function createStdListHubModel(
  name: string,
  objId: string | undefined,
  options: Vars
): HubModel {
  const homePath = Walnut.getObjPath(name);
  const storeOptions: StdListStoreOptions = _.assign({}, options, {
    homePath,
  });

  const store = useStdListStore(storeOptions);
  const createGUIContext = () => {
    let _s = store;
    return {
      HomeId: _s.HomeObj.value?.id,
      HomeObj: _s.HomeObj.value,
      currentId: _s.currentId.value,
      checkedIds: _s.checkedIds.value,
      query: _s.query.value,
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
      CurrentContent: _s.CurrentContent.value,
    };
  };

  async function reload() {
    await store.reload();
    if (objId) {
      store.updateSelection(objId);
    }
  }

  async function refresh() {
    await store.refresh();
  }

  return {
    store,
    createGUIContext,
    getActionBarVars: () => store.ActionBarVars.value,
    reload,
    refresh,
  };
}
