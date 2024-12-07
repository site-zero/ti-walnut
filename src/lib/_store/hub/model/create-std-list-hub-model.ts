import { Vars } from '@site0/tijs';
import _ from 'lodash';
import { computed } from 'vue';
import { Walnut } from '../../../../core';
import {
  StdListStoreOptions,
  useStdListStore,
} from '../../std/use-std-list.store';
import { HubModel } from '../hub-view-types';

export function createStdListHubModel(name: string, options: Vars):HubModel {
  const homePath = Walnut.getObjPath(name);
  const storeOptions: StdListStoreOptions = _.assign({}, options, {
    homePath,
  });

  const store = computed(() => useStdListStore(storeOptions));
  const guiContext = computed(() => {
    let _s = store.value;
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
      CurrentContent: _s.CurrentContent.value,
    };
  });

  return {
    store,
    guiContext,
  };
}
