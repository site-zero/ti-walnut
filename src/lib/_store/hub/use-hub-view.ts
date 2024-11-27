import { ref } from 'vue';
import { HubViewOptions, HubViewState } from './hub-view-types';
import {
  _use_hub_actions_reload,
  _use_hub_layout_reload,
  _use_hub_methods_reload,
  _use_hub_schema_reload,
} from './use-hub--reload';

export function useWnHub(options: HubViewOptions) {
  //---------------------------------------------
  // 数据模型
  //---------------------------------------------
  const _state: HubViewState = {
    createContext: () => ({}),
    actions: ref({}),
    layout: ref({
      desktop: {},
      pad: {},
      phone: {},
    }),
    schema: ref({}),
    methods: {},
  };
  //---------------------------------------------
  // 组合加载操作
  //---------------------------------------------
  const reloadActions = _use_hub_actions_reload(options, _state);
  const reloadLayout = _use_hub_layout_reload(options, _state);
  const reloadSchema = _use_hub_schema_reload(options, _state);
  const reloadMethods = _use_hub_methods_reload(options, _state);
  //---------------------------------------------
  // 远程方法
  //---------------------------------------------
  async function reload() {
    await Promise.all([
      reloadActions(),
      reloadLayout(),
      reloadSchema(),
      reloadMethods(),
    ]);
  }
  //---------------------------------------------
  // 本地方法
  //---------------------------------------------
}
