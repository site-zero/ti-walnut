import { Util, Vars } from '@site0/tijs';
import { ComputedRef, ref } from 'vue';
import {
  HubModel,
  HubViewLayoutMode,
  HubViewOptions,
  HubViewState,
} from './hub-view-types';
import { useHubModel } from './use-hub--model';
import {
  _reload_hub_actions,
  _reload_hub_layout,
  _reload_hub_methods,
  _reload_hub_schema,
} from './use-hub--reload';

export type HubView = ReturnType<typeof useHubView>;

export function useHubView(
  viewMode: ComputedRef<HubViewLayoutMode>,
  options: HubViewOptions
) {
  console.warn('useHubView', viewMode, options);
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
  const createGUIContext = () => {
    return _model.value?.createGUIContext() ?? {};
  };
  const createGUILayout = (GUIContext: Vars) => {
    let layout = _state.layout.value[viewMode.value];
    return Util.explainObj(GUIContext, layout);
  };
  const createGUISchema = (GUIContext: Vars) => {
    let schema = _state.schema.value ?? {};
    return Util.explainObj(GUIContext, schema);
  };
  const createGUIActions = (GUIContext: Vars) => {
    return Util.explainObj(GUIContext, _state.actions.value);
  };
  //---------------------------------------------
  // 远程方法
  //---------------------------------------------
  async function reload(modelName: string, objId?: string) {
    // 读取数据模型
    _model.value = useHubModel(modelName, objId, options);
    await _model.value.reload();

    // 读取所有的资源文件
    await Promise.all([
      _reload_hub_actions(options, _state),
      _reload_hub_layout(options, _state),
      _reload_hub_schema(options, _state),
      _reload_hub_methods(options, _state),
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
    _model,
    _state,
    createGUIContext,
    createGUILayout,
    createGUISchema,
    createGUIActions,
    reload,
    invoke,
  };
}
