import {
  ActionBarEvent,
  ActionBarProps,
  BlockEvent,
  isAsyncFunc,
  Util,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import { Router } from 'vue-router';
import { GlobalStatusApi } from '../../_features';
import { GuiViewLayoutMode, WnObj } from '../../_types';
import { GuiViewMeasureApi } from '../use-gui-view-measure.store';
import { UserSessionApi } from '../use-session.store';
import { HubModel, HubViewOptions, HubViewState } from './hub-view-types';
import { useHubModel } from './use-hub--model';
import {
  _reload_hub_actions,
  _reload_hub_layout,
  _reload_hub_methods,
  _reload_hub_schema,
} from './use-hub--reload';
import { HubNav, useHubNav } from './use-hub-nav';

type InvokeError = {
  methodNotFound: boolean;
  methodName: string;
};

function isInvokeError(err: any): err is InvokeError {
  return err && err.methodNotFound && _.isString(err.methodName);
}

export type HubViewApi = ReturnType<typeof useHubViewApi>;

export type HubViewApiOptions = {
  global: GlobalStatusApi;
  router: Router;
  session: UserSessionApi;
  measure: GuiViewMeasureApi;
};

export function useHubViewApi(options: HubViewApiOptions) {
  const session = options.session;
  const _gb_sta = options.global;
  const _router = options.router;
  //---------------------------------------------
  // 数据模型
  //---------------------------------------------
  const _view_loading = ref(false);
  const _hub_obj = ref<WnObj>();
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
    // console.log('createGUIContext');
    let gbs = {
      session: _.cloneDeep(session.data),
      G: _.cloneDeep(_gb_sta.data),
      appPath: _gb_sta.parseAppPath(),
    };

    // 根据模型创建基础上下文
    let re = _model.value?.createGUIContext() ?? {};

    // 融合全局状态
    _.assign(re, gbs);

    // 将全局状态传递给主动作条
    if (re.ActionBarVars) {
      _.assign(re.ActionBarVars, gbs);
    }
    return re;
  };
  const createGUILayout = (GUIContext: Vars, viewMode: GuiViewLayoutMode) => {
    // console.log('createGUILayout', GUIContext, viewMode);
    let layout = _state.layout.value[viewMode] ?? {};
    return Util.explainObj(GUIContext, layout);
  };
  const createGUISchema = (GUIContext: Vars) => {
    // console.log('createGUISchema', GUIContext);
    let schema = _state.schema.value ?? {};
    return Util.explainObj(GUIContext, schema);
  };
  const createGUIActions = (GUIContext: Vars) => {
    return Util.explainObj(GUIContext, _state.actions.value) as ActionBarProps;
  };
  //--------------------------------------------
  function setLoading(loading: boolean) {
    _view_loading.value = loading;
  }

  //---------------------------------------------
  // 远程方法
  //---------------------------------------------
  /**
   * 加载视图的入口方法 。 这个方法会加载模型、布局、方法、动作等所有的资源。
   *
   * @param modelName 模块名称：
   *  - std 就是顶级目录名
   *  - rds 就是数据实体名
   * @param objPath 模块内部对象路径【选】
   *  - std 就是目录下的对象相对路径。
   *  - rds 就是数据实体的对象主键
   * @param options 视图选项。
   */
  async function reload(
    hubObj: WnObj,
    options: HubViewOptions,
    objId?: string
  ) {
    _hub_obj.value = hubObj;
    _options.value = options;
    // 记录视图名称
    _gb_sta.data.viewName = options.viewName;
    // 读取数据模型
    _model.value = useHubModel(_gb_sta, hubObj, options, objId);
    await _model.value.reload();

    // 预先加载所有方法
    await _reload_hub_methods(options, _state),
      // 读取所有的资源文件
      (_view_loading.value = true);
    await Promise.all([
      _reload_hub_schema(options, _state),
      _reload_hub_actions(options, _state),
      _reload_hub_layout(options, _state),
    ]);
    _view_loading.value = false;
  }

  //---------------------------------------------
  // 为控件提供的操作方法
  type InvokeThat = HubNav &
    GlobalStatusApi & {
      api: any;
      methods: Record<string, Function>;
      invoke: (methodName: string, ...args: any[]) => Promise<any>;
    };
  //---------------------------------------------
  async function invoke(methodName: string, ...args: any[]) {
    if (!_model.value) {
      throw `Model not loaded`;
    }

    // nav 相关
    const _nav = useHubNav(_gb_sta, _router);

    // 定义调用时的 this
    const that = {
      ..._nav,
      ..._gb_sta,
      api: _model.value.store,
      methods: _state.methods,
    } as InvokeThat;

    // 定义内部调用方法
    that.invoke = async (methodName: string, ...args: any[]): Promise<any> => {
      // 获取自定义方法
      let fn = that.methods[methodName];

      // 没有自定义方法的话，是不是模型就提供了呢？
      if (!fn) {
        fn = that.api[methodName];
      }

      // 嗯，找到了一个方法，调用一下 ...
      if (fn) {
        if (isAsyncFunc(fn)) {
          return await fn.apply(that, args);
        }
        return fn.apply(that, args);
      }
      // 未找到定义，抛个异常
      else {
        throw {
          methodNotFound: true,
          methodName,
        };
      }
    };

    // 执行调用
    return that.invoke(methodName, ...args);
  }

  /**
   * 处理区块事件的异步函数。
   *
   * @param event - 包含事件名称和数据的区块事件对象。
   * @returns 返回一个Promise，表示事件处理的结果。
   * @throws 如果不是内部调用异常，则抛出错误。
   */
  async function onBlockEvent(event: BlockEvent) {
    let fnName = `on_${_.snakeCase(event.eventName)}`;
    // 尝试直接找到调用函数
    try {
      return await invoke(fnName, event.data);
    } catch (err: any) {
      // 不是内部的调用异常，就不忍
      if (!isInvokeError(err)) {
        throw err;
      }
    }
    // 没办法了，看看有没有一个通用的调用函数
    try {
      return await invoke('handleBlockEvents', event);
    } catch (err: any) {
      // 用户未能成功处理这个事件，那么打印一个警告，给出详细提示
      console.error(err);
      console.error(
        `Fail to handle event [${event.eventName}], 
        you need define function '${fnName}' or 'handleBlockEvents'
        in your methods.js`,
        event
      );
    }
  }

  /**
   * 处理 ActionBar 事件的异步函数。
   *
   * @param {ActionBarEvent} event - 触发的 ActionBar 事件。
   * @returns {Promise<void>} - 一个表示异步操作完成的 Promise。
   */
  async function onActionFire(event: ActionBarEvent) {
    let fnName = `${_.snakeCase(event.name)}`;
    // 尝试直接找到调用函数
    try {
      return await invoke(fnName, event.payload);
    } catch (err: any) {
      // 不是内部的调用异常，就不忍。 因为这说明用户的函数已经
      // 处理了这个调用，但是它抛出了异常
      if (!isInvokeError(err)) {
        throw err;
      }
    }
    // 没办法了，看看有没有一个通用的调用函数
    try {
      return await invoke('handleActionFire', event);
    } catch (err: any) {
      // 用户未能成功处理这个事件，那么打印一个警告，给出详细提示
      console.error(err);
      console.error(
        `Fail to handle event [${event.name}], 
        you need define function '${fnName}' or 'handleActionFire'
        in your methods.js`,
        event
      );
    }
  }
  //---------------------------------------------
  // 返回特性
  //---------------------------------------------
  return {
    model: computed(() => _model.value),
    Options: computed(() => _options.value),
    isViewLoading: computed(() => _view_loading.value),
    ActioinBarVars: computed(() => _model.value?.getActionBarVars() ?? {}),

    // Other API
    global: computed(() => options.global),
    session: computed(() => options.session),
    measure: computed(() => options.measure),
    router: _router,

    // HubViewState
    ..._state,

    // methods
    setLoading,
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
