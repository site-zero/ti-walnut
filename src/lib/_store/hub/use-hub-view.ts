import {
  ActionBarEvent,
  BlockEvent,
  isAsyncFunc,
  Util,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import { GuiViewLayoutMode } from '../../_types';
import { HubModel, HubViewOptions, HubViewState } from './hub-view-types';
import { useHubModel } from './use-hub--model';
import {
  _reload_hub_actions,
  _reload_hub_layout,
  _reload_hub_methods,
  _reload_hub_schema,
} from './use-hub--reload';

export type HubView = ReturnType<typeof useHubView>;

type InvokeError = {
  methodNotFound: boolean;
  methodName: string;
};

function isInvokeError(err: any): err is InvokeError {
  return err && err.methodNotFound && _.isString(err.methodName);
}

export function useHubView() {
  //---------------------------------------------
  // 数据模型
  //---------------------------------------------
  const _modelName = ref<string>();
  const _objId = ref<string>();
  const _options = ref<HubViewOptions>();
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
  const createGUILayout = (GUIContext: Vars, viewMode: GuiViewLayoutMode) => {
    let layout = _state.layout.value[viewMode] ?? {};
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
  async function reload(
    modelName: string,
    objId: string | undefined,
    options: HubViewOptions
  ) {
    _modelName.value = modelName;
    _objId.value = objId;
    _options.value = options;
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

    let _store = _model.value.store;

    // 获取自定义方法
    let fn = _state.methods[methodName];

    // 没有自定义方法的话，是不是模型就提供了呢？
    if (!fn) {
      fn = _store[methodName];
    }
    // 调用一下
    if (fn) {
      if (isAsyncFunc(fn)) {
        return await fn.apply(_store, args);
      }
      return fn.apply(_store, args);
    }
    // 未找到定义
    else {
      throw {
        methodNotFound: true,
        methodName,
      };
    }
  }

  /**
   * 处理区块事件的异步函数。
   *
   * @param event - 包含事件名称和数据的区块事件对象。
   * @returns 返回一个Promise，表示事件处理的结果。
   * @throws 如果不是内部调用异常，则抛出错误。
   */
  async function onBlockEvent(event: BlockEvent) {
    // 尝试直接找到调用函数
    try {
      let fnName = `on_${_.snakeCase(event.eventName)}`;
      return await invoke(fnName, event.data);
    } catch (err: any) {
      // 不是内部的调用异常，就不忍
      if (!isInvokeError(err)) {
        throw err;
      }
    }
    // 没办法了，看看有没有一个通用的调用函数
    return await invoke('handleBlockEvent', event);
  }

  /**
   * 处理 ActionBar 事件的异步函数。
   *
   * @param {ActionBarEvent} event - 触发的 ActionBar 事件。
   * @returns {Promise<void>} - 一个表示异步操作完成的 Promise。
   */
  async function onActionFire(event: ActionBarEvent) {
    console.log('onActionFire', event);
  }
  //---------------------------------------------
  // 返回特性
  //---------------------------------------------
  return {
    _model,
    ModelName: computed(() => _modelName.value),
    ObjId: computed(() => _objId.value),
    Options: computed(() => _options.value),
    ..._state,
    createGUIContext,
    createGUILayout,
    createGUISchema,
    createGUIActions,
    reload,
    invoke,
    onBlockEvent,
    onActionFire,
  };
}
