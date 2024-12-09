import { Util, Vars } from '@site0/tijs';
import _ from 'lodash';
import { computed } from 'vue';
import { RdsMetaStoreOptions, useRdsMetaStore } from '../../../../..';
import { HubModel } from '../hub-view-types';

export function createRdsMetaHubModel(
  tableName: string,
  objId: string | undefined,
  options: Vars
): HubModel {
  const storeOptions: RdsMetaStoreOptions = _.assign(
    {
      filter: {},
      sqlFetch: `${tableName}.fetch`,
    },
    Util.explainObj({ id: objId }, options)
  );

  const store = computed(() => useRdsMetaStore(storeOptions));
  const guiContext = computed(() => {
    let _s = store.value;
    return {
      ActionStatus: _s.ActionStatus.value,
      LoadStatus: _s.LoadStatus.value,
      metaData: _s.metaData.value,
      changed: _s.changed.value,
    };
  });

  async function reload() {
    await store.value.reload();
  }

  async function refresh() {
    await store.value.fetchRemoteMeta();
  }

  return {
    store,
    guiContext,
    reload,
    refresh,
  };
}
