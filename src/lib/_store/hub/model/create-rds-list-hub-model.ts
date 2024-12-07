import { Vars } from '@site0/tijs';
import _ from 'lodash';
import { computed } from 'vue';
import { RdsListStoreOptions, useRdsListStore } from '../../../../..';
import { HubModel } from '../hub-view-types';

export function createRdsListHubModel(
  name: string,
  objId: string | undefined,
  options: Vars
): HubModel {
  const storeOptions: RdsListStoreOptions = _.assign(
    {
      query: {
        filter: {},
      },
      sqlQuery: `${name}.select`,
      sqlCount: `${name}.count`,
    },
    options
  );

  const store = computed(() => useRdsListStore(storeOptions));
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
    };
  });

  async function reload() {
    await store.value.reload();
    if (objId) {
      store.value.updateSelection(objId);
    }
  }

  async function refresh() {
    await store.value.queryRemoteList();
  }

  return {
    store,
    guiContext,
    reload,
    refresh,
  };
}
