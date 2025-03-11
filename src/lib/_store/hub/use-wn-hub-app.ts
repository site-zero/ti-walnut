import { ActionBarProps } from '@site0/tijs';
import { computed, InjectionKey, ref } from 'vue';
import { Router } from 'vue-router';
import { GlobalStatusApi } from '../../_features';
import { HubView } from '../../_store';

export type WnHubApp = ReturnType<typeof useWnHubApp>;

export const WN_HUB_APP_INST: InjectionKey<WnHubApp> =
  Symbol('WN_HUB_APP_INST');

export function useWnHubApp(_hub_view: HubView) {
  const _gb_st: GlobalStatusApi = _hub_view.global;
  const router: Router = _hub_view.router;
  //--------------------------------------------------
  const _main_actions = ref<ActionBarProps>();
  //--------------------------------------------------
  function setMainActions(actionProps?: ActionBarProps) {
    _main_actions.value = actionProps;
  }
  //--------------------------------------------------
  function open(href: string) {
    router.push(href);
    _gb_st.data.appPath = href;
  }
  //--------------------------------------------------
  function setAppPath(appPath: string) {
    _gb_st.data.appPath = appPath;
  }
  //--------------------------------------------------
  return {
    open,
    setAppPath,
    setMainActions,
    MainActions: computed(() => _main_actions.value ?? {}),
    view: _hub_view,
  };
}
