import { Icons, Vars } from '@site0/tijs';
import _ from 'lodash';
import { WnObj } from '../../../_types';
import {
  StdMetaStoreOptions,
  useStdMetaStore,
} from '../../std/use-std-meta.store';
import { HubModel } from '../hub-view-types';

export function createStdMetaHubModel(hubObj: WnObj, options: Vars): HubModel {
  const storeOptions: StdMetaStoreOptions = _.assign({}, options, {
    objPath: hubObj,
  });

  const store = useStdMetaStore(storeOptions);
  const createGUIContext = () => {
    let _s = store;
    return {
      HomeIcon: Icons.getIcon(_s.MetaData.value, 'far-file-alt'),
      ActionStatus: _s.ActionStatus.value,
      ActionBarVars: _s.ActionBarVars.value,
      LoadStatus: _s.LoadStatus.value,
      MetaData: _s.MetaData.value,
      MetaId: _s.MetaId.value,
      changed: _s.changed.value,
      CurrentContent: _s.CurrentContent.value,
    };
  };

  async function reload() {
    await store.reload();
  }

  async function refresh() {
    await store.refresh();
  }

  return {
    modelType: 'STD-META',
    store,
    createGUIContext,
    getActionBarVars: () => store.ActionBarVars.value,
    reload,
    refresh,
  };
}
