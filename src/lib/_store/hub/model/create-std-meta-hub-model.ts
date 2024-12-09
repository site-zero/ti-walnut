import { Vars } from '@site0/tijs';
import _ from 'lodash';
import { computed } from 'vue';
import {
  StdMetaStoreOptions,
  useStdMetaStore,
} from '../../std/use-std-meta.store';
import { HubModel } from '../hub-view-types';

export function createStdMetaHubModel(
  _dirName: string,
  objId: string,
  options: Vars
): HubModel {
  const storeOptions: StdMetaStoreOptions = _.assign({}, options, {
    objPath: `id:${objId}`,
  });

  const store = computed(() => useStdMetaStore(storeOptions));
  const guiContext = computed(() => {
    let _s = store.value;
    return {
      ActionStatus: _s.ActionStatus.value,
      LoadStatus: _s.LoadStatus.value,
      metaData: _s.metaData.value,
      changed: _s.changed.value,
      CurrentContent: _s.CurrentContent.value,
    };
  });

  async function reload() {
    await store.value.reload();
  }

  async function refresh() {
    await store.value.refresh();
  }

  return {
    store,
    guiContext,
    reload,
    refresh,
  };
}
