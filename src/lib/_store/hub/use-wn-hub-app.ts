import { ActionBarProps } from '@site0/tijs';
import { computed, InjectionKey, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStatus } from '../../_features';
import { GuiViewMeasure, HubView } from '../../_store';

export type WnHubApp = ReturnType<typeof useWnHubApp>;

export const WN_HUB_APP_INST: InjectionKey<WnHubApp> =
  Symbol('WN_HUB_APP_INST');

export function useWnHubApp(_hub_view: HubView, _measure: GuiViewMeasure) {
  const _gb_st = useGlobalStatus();
  const router = useRouter();
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
    measure: _measure,
  };
}
