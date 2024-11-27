import { isAsyncFunc } from '@site0/tijs';
import _ from 'lodash';
import { Walnut } from '../../../core';
import { HubViewOptions, HubViewState } from './hub-view-types';

async function __load<T>(
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
    return await Walnut.loadJson(input);
  }
  // 什么都没有，清空
  return dft;
}

export function _use_hub_actions_reload(
  options: HubViewOptions,
  _state: HubViewState
) {
  return async () => {
    _state.actions.value = await __load(options.actions, {});
  };
}

export function _use_hub_layout_reload(
  options: HubViewOptions,
  _state: HubViewState
) {
  return async () => {
    _state.layout.value = await __load(options.layout, {
      desktop: {},
      pad: {},
      phone: {},
    });
  };
}

export function _use_hub_schema_reload(
  options: HubViewOptions,
  _state: HubViewState
) {
  return async () => {
    _state.schema.value = await __load(options.schema, {});
  };
}

export function _use_hub_methods_reload(
  options: HubViewOptions,
  _state: HubViewState
) {
  return async () => {
    if (options.methods) {
      // 存储加载结果
      let _loaded_methods = [] as any[];
      let loadings = [] as Promise<void>[];

      // 定义一个加载方法
      async function _load_(path: string) {
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
  };
}
