import { isAsyncFunc } from '@site0/tijs';
import _ from 'lodash';
import { genWnPath, safeCmdArg, Walnut } from '../../../core';
import { GuiViewLayout } from '../../_types';
import {
  HubViewOptions,
  HubViewState,
  isHubViewLayout,
} from './hub-view-types';

const _CACHE = new Map<string, any>();

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
    // 尝试缓存
    let re = _CACHE.get(path);
    if (re) {
      return re as T;
    }
    // 真正读取
    re = await Walnut.loadJson(path);
    _CACHE.set(path, re);
    return re as T;
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

    // 定义一个加载方法
    async function _load_(path: string) {
      if (options.modelOptions?.homePath) {
        path = genWnPath(options.modelOptions!.homePath, path);
      } else {
        path = safeCmdArg(path);
      }
      let jsPath = Walnut.cookPath(path);
      let re = await Walnut.loadJsModule(jsPath);
      _loaded_methods.push(re);
    }

    // 准备加载逻辑
    for (let path of options.methods) {
      loadings.push(_load_(path));
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
