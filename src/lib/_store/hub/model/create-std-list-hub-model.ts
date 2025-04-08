import { Icons } from '@site0/tijs';
import _ from 'lodash';
import {
  StdListStoreOptions,
  useStdListStore,
} from '../../std/use-std-list.store';
import { HubModel, HubModelCreateSetup } from '../hub-view-types';

export function createStdListHubModel(setup: HubModelCreateSetup): HubModel {
  let { global: _gb_sta, hubObj, modelOptions, objId } = setup;
  const storeOptions: StdListStoreOptions = _.assign({}, modelOptions, {
    homePath: hubObj,
    globalStatus: _gb_sta,
  });

  const store = useStdListStore(storeOptions);
  const createGUIContext = () => {
    let _s = store;
    return {
      HomeIcon: Icons.getIcon(_s.HomeObj.value, 'far-file-alt'),
      HomeId: _s.HomeObj.value?.id,
      HomeObj: _s.HomeObj.value,
      IndexDirObj: _s.IndexDirObj.value,
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
    modelType: 'STD-LIST',
    store,
    createGUIContext,
    getActionBarVars: () => store.ActionBarVars.value,
    reload,
    refresh,
  };
}
