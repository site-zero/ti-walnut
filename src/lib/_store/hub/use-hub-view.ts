import { Util } from '@site0/tijs';
import { computed, ComputedRef, ref } from 'vue';
import {
  HubModel,
  HubViewLayoutMode,
  HubViewOptions,
  HubViewState,
} from './hub-view-types';
import { useHubModel } from './use-hub--model';
import {
  _use_hub_actions_reload,
  _use_hub_layout_reload,
  _use_hub_methods_reload,
  _use_hub_schema_reload,
} from './use-hub--reload';

export function useWnHub(
  viewMode: ComputedRef<HubViewLayoutMode>,
  options: HubViewOptions
) {
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
    let schema = _state.schema.value[viewMode.value];
    return Util.explainObj(GUIContext.value, schema);
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
  async function reload(modelName: string, objId?: string) {
    // 读取数据模型
    _model.value = useHubModel(modelName, objId, options);

    // 读取所有的资源文件
    await Promise.all([
      reloadActions(),
      reloadLayout(),
      reloadSchema(),
      reloadMethods(),
    ]);
  }
  //---------------------------------------------
  // 为控件提供的操作方法
  //---------------------------------------------
  async function invoke(methodName: string, ...args: any[]) {
    if (!_model.value) {
      throw `Model not loaded`;
    }

    let _store = _model.value.store.value;

    // 获取自定义方法
    let fn = _state.methods[methodName];

    // 没有自定义方法的话，是不是模型就提供了呢？
    if (!fn) {
      fn = _store[methodName];
    }
    // 调用一下
    if (fn) {
      return await fn.apply(_store, args);
    }
    // 未找到定义
    else {
      throw `Method ${methodName} not found in customized method set or model storeApi`;
    }
  }
  //---------------------------------------------
  // 返回特性
  //---------------------------------------------
  return {
    GUIContext,
    GUILayout,
    GUIScheme,
    GUIActions,
    reload,
    invoke,
  };
}
