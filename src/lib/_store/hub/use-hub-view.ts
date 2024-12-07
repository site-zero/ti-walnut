import { Util } from '@site0/tijs';
import { computed, ref } from 'vue';
import { HubModel, HubViewOptions, HubViewState } from './hub-view-types';
import { useHubModel } from './use-hub--model';
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
  const _model = ref<HubModel>();
  const _state: HubViewState = {
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
  // 计算输出
  //--------------------------------------------
  const GUIContext = computed(() => {
    return _model.value?.guiContext.value ?? {};
  });
  const GUILayout = computed(() => {
    return Util.explainObj(GUIContext.value, _state.layout.value);
  });
  const GUIScheme = computed(() => {
    return Util.explainObj(GUIContext.value, _state.schema.value);
  });
  const GUIActions = computed(() => {
    return Util.explainObj(GUIContext.value, _state.actions.value);
  });
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
  async function reload(modelName: string) {
    // 读取数据模型
    _model.value = useHubModel(modelName, options);

    // 读取所有的资源文件
    await Promise.all([
      reloadActions(),
      reloadLayout(),
      reloadSchema(),
      reloadMethods(),
    ]);
  }
  //---------------------------------------------
  // 返回特性
  //---------------------------------------------
}
