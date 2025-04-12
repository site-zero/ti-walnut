import { Icons, Vars } from '@site0/tijs';
import _ from 'lodash';
import {
  StdMetaStoreOptions,
  useStdMetaStore,
} from '../../std/use-std-meta.store';
import { HubModel, HubModelCreateSetup } from '../hub-view-types';

export function createStdMetaHubModel(setup: HubModelCreateSetup): HubModel {
  let { global: _gb_sta, hubObj, modelOptions, objId } = setup;
  const storeOptions: StdMetaStoreOptions = _.assign({}, modelOptions, {
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

  function getChanges(): Vars[] {
    let re: Vars[] = [];
    re.push(store.makeMetaDifferent());
    re.push(...store.makeContentDifferents());
    return re;
  }

  return {
    modelType: 'STD-META',
    store,
    createGUIContext,
    getActionBarVars: () => store.ActionBarVars.value,
    reload,
    refresh,
    getChanges,
  };
}
