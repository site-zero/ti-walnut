import { Util, Vars } from '@site0/tijs';
import _ from 'lodash';
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

  const store = useRdsMetaStore(storeOptions);
  const createGUIContext = () => {
    let _s = store;
    return {
      ActionStatus: _s.ActionStatus.value,
      LoadStatus: _s.LoadStatus.value,
      metaData: _s.metaData.value,
      changed: _s.changed.value,
    };
  };

  async function reload() {
    await store.reload();
  }

  async function refresh() {
    await store.fetchRemoteMeta();
  }

  return {
    store,
    createGUIContext,
    reload,
    refresh,
  };
}
