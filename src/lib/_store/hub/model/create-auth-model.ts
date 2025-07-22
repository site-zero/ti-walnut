import { Vars } from "@site0/tijs";
import _ from "lodash";
import { RefreshOptions } from "../../..";
import { AuthStoreOptions, useAuthStore } from "../../auth/use-auth.store";
import { HubModel, HubModelCreateSetup } from "../hub-view-types";

export function createAuthHubModel(setup: HubModelCreateSetup): HubModel {
  let { global: _gb_sta, modelOptions, objId } = setup;
  const storeOptions = _.assign({}, modelOptions, {
    globalStatus: _gb_sta,
  }) as AuthStoreOptions;

  const store = useAuthStore(storeOptions);
  const createGUIContext = () => {
    let _s = store;
    let re: Vars = {
      currentId: _s.Main.value?.currentId.value,
      checkedIds: _s.Main.value?.checkedIds.value,
      query: _s.Main.value?.query.value,
      ActionStatus: _s.Main.value?.ActionStatus.value,
      ActionBarVars: _s.ActionBarVars.value,
      LoadStatus: _s.Main.value?.LoadStatus.value,
      listData: _s.listData.value,
      hasCurrent: _s.Main.value?.hasCurrent.value,
      hasChecked: _s.Main.value?.hasChecked.value,
      changed: _s.changed.value,
      isEmpty: _s.Main.value?.isEmpty.value,
      isRemoteEmpty: _s.Main.value?.isRemoteEmpty.value,
      isLocalEmpty: _s.Main.value?.isLocalEmpty.value,
      CurrentItem: _s.CurrentItem.value,
    };
    return re;
  };

  async function reload() {
    await store.reload();
    if (objId) {
      store.Main.value?.updateSelection(objId);
    }
  }

  async function refresh(options: RefreshOptions = {}) {
    await store.refresh(options);
  }

  function getChanges(): Vars[] {
    return store.getChanges();
  }

  return {
    modelType: "AUTH",
    store,
    createGUIContext,
    getActionBarVars: () => store.Main.value?.ActionBarVars.value ?? {},
    reload,
    refresh,
    getChanges,
  };
}
