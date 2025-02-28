import { isAsyncFunc } from '@site0/tijs';
import _ from 'lodash';
import { genWnPath, safeCmdArg, Walnut } from '../../../core';
import { GuiViewLayout } from '../../_types';
import {
  HubViewOptions,
  HubViewState,
  isHubViewLayout,
} from './hub-view-types';

async function __load<T>(
  homePath: string | undefined,
  input: string | (() => T) | (() => Promise<T>) | undefined,
  dft: T
): Promise<T> {
  // 自定义
  if (_.isFunction(input)) {
    // 异步方法
    if (isAsyncFunc(input)) {
      let ats = await input();
      return ats as T;
    }
    // 普通方法
    let ats = input();
    return ats as T;
  }
  // 直接从对象路径加载
  if (_.isString(input)) {
    let path: string;
    if (homePath) {
      path = genWnPath(homePath, input);
    } else {
      path = safeCmdArg(input);
    }
    // 真正读取
    return await Walnut.loadJson(path, { cache: true });
  }
  // 什么都没有，清空
  return dft;
}

export async function _reload_hub_actions(
  options: HubViewOptions,
  _state: HubViewState
) {
  _state.actions.value = await __load(
    options.modelOptions?.homePath,
    options.actions,
    {}
  );
}

export async function _reload_hub_layout(
  options: HubViewOptions,
  _state: HubViewState
) {
  let re = await __load(options.modelOptions?.homePath, options.layout, {
    desktop: {},
    pad: {},
    phone: {},
  });
  if (isHubViewLayout(re)) {
    let { desktop, pad, phone } = re;
    let dft = desktop || pad || phone;
    _state.layout.value = {
      desktop: desktop || dft,
      pad: pad || dft,
      phone: phone || dft,
    } as GuiViewLayout;
  }
  // 全都一样
  else {
    _state.layout.value = {
      desktop: re,
      pad: re,
      phone: re,
    } as GuiViewLayout;
  }
}

export async function _reload_hub_schema(
  options: HubViewOptions,
  _state: HubViewState
) {
  _state.schema.value = await __load(
    options.modelOptions?.homePath,
    options.schema,
    {}
  );
}

export async function _reload_hub_methods(
  options: HubViewOptions,
  _state: HubViewState
) {
  if (options.methods) {
    // 存储加载结果
    let _loaded_methods = [] as any[];
    let loadings = [] as Promise<void>[];

    /**
     * 动态加载指定路径的 JavaScript 模块。
     *
     * @private
     * @async
     *
     * 此函数用于动态加载 JavaScript 模块，并根据配置选项调整模块路径。
     * 它确保路径格式正确，然后使用 `Walnut.loadJsModule` 加载模块，
     * 并将加载的模块合并至上一层函数的输出结果集
     *
     * @param path - 要加载的 JavaScript 模块的路径。
     * 如果设置了 `options.modelOptions.homePath`，则此路径是相对于它的相对路径。
     *
     * @returns {Promise<void>} - 一个 Promise，在模块加载并存储后解析。
     */
    async function __do_load_js_mod(path: string) {
      if (options.modelOptions?.homePath) {
        path = genWnPath(options.modelOptions!.homePath, path);
      } else {
        path = safeCmdArg(path);
      }
      let jsPath = Walnut.cookPath(path);
      let re = await Walnut.loadJsModule(jsPath, { cache: true });
      _loaded_methods.push(re);
    }

    // 准备加载逻辑
    for (let path of options.methods) {
      loadings.push(__do_load_js_mod(path));
    }

    // 归纳最后加载结果
    let re = {} as Record<string, Function>;
    if (!_.isEmpty(loadings)) {
      await Promise.all(loadings);
      for (let loaded of _loaded_methods) {
        _.assign(re, loaded);
      }
    }

    // 保存
    _state.methods = re;
  }
  // 清空方法集合
  else {
    _state.methods = {};
  }
}
