import { Util, Vars } from '@site0/tijs';
import _ from 'lodash';
import { RdsMetaStoreOptions, useRdsMetaStore } from '../../../../..';
import { HubModel } from '../hub-view-types';

export function createRdsMetaHubModel(options: Vars, objId?: string): HubModel {
  const storeOptions = _.assign(
    { filter: {} },
    Util.explainObj({ id: objId }, options)
  ) as RdsMetaStoreOptions;

  const store = useRdsMetaStore(storeOptions);
  const createGUIContext = () => {
    let _s = store;
    return {
      ActionStatus: _s.ActionStatus.value,
      LoadStatus: _s.LoadStatus.value,
      MetaData: _s.MetaData.value,
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
    modelType: 'RDS-META',
    store,
    createGUIContext,
    getActionBarVars: () => store.ActionBarVars.value,
    reload,
    refresh,
  };
}
