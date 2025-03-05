import { KeepInfo, Vars } from '@site0/tijs';
import JSON5 from 'json5';
import _ from 'lodash';
import {
  LocalMetaPatcher,
  LocalUpdateMetaPatcher,
  RedQueryPrefixSetup,
} from '../../..';
import {
  isSqlExecFetchBack,
  QueryFilter,
  SqlExecFetchBack,
  SqlExecSetVar,
  SqlQuery,
  SqlResult,
} from '../../../_types';

export function useModelOptionGetter(input: Vars) {
  /**
   * 从输入对象中获取指定键的字符串值。
   *
   * @param key 键名
   * @returns 字符串值或 undefined
   */
  function getString(key: string): string | undefined {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return;
    }
    if (_.isString(re)) {
      return re;
    }
    return `${re}`;
  }

  /**
   * 从输入对象中获取指定键的字符串值。
   *
   * @param key 键名
   * @returns 字符串值或 undefined
   */
  function getBoolean(key: string): boolean | undefined {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return;
    }
    if (_.isBoolean(re)) {
      return re;
    }
    if (_.isString(re)) {
      return /^(true|yes|on)$/i.test(re);
    }
  }

  /**
   * 从输入对象中获取指定键的回调函数。
   *
   * @param key 键名
   * @returns 函数或 undefined
   */
  function getFunction<T>(key: string): T | undefined {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return;
    }
    if (_.isFunction(re)) {
      return re as T;
    }
  }

  /**
   * 获取 KeepInfo
   * @param key 键名
   * @returns KeepInfo 对象或 undefined
   */
  function getKeepInfo(key: string): KeepInfo | undefined {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return;
    }
    if (_.isString(re)) {
      return re;
    }
    if (_.isObject(re)) {
      return re as KeepInfo;
    }
  }

  /**
   * 获取 QueryFilter
   * @param key 键名
   * @returns QueryFilter 对象或 undefined
   */
  function getQueryFilter(key: string): QueryFilter | undefined {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return;
    }
    if (_.isString(re)) {
      return JSON5.parse(re) as QueryFilter;
    }
    if (_.isObject(re)) {
      return re as QueryFilter;
    }
  }

  /**
   * 获取 SqlQuery
   * @param key 键名
   * @returns SqlQuery 对象或 undefined
   */
  function getQuery(
    key: string,
    dft: SqlQuery = { filter: { '1': 1 } }
  ): SqlQuery | (() => SqlQuery) {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return dft;
    }
    if (_.isString(re)) {
      return JSON5.parse(re) as SqlQuery;
    }
    if (_.isObject(re)) {
      return re as SqlQuery;
    }
    if (_.isFunction(re)) {
      return re;
    }
    return dft;
  }

  /**
   * 获取 RedQueryPrefixSetup
   * @param key 键名
   * @returns RedQueryPrefixSetup 对象或 undefined
   */
  function getRdsQueryPrefixSetup(
    key: string
  ): RedQueryPrefixSetup | undefined {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return;
    }
    if (_.isString(re)) {
      return JSON5.parse(re) as RedQueryPrefixSetup;
    }
    if (_.isObject(re)) {
      return re as RedQueryPrefixSetup;
    }
    if (_.isFunction(re)) {
      return re;
    }
  }

  /**
   * 获取 SqlExecSetVar 数组的构造函数
   * @param key 键名
   * @returns 构造函数或 undefined
   */
  function getSqlExecSetVarArrayGetter(
    key: string
  ): (() => SqlExecSetVar[]) | undefined {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return;
    }
    if (_.isString(re)) {
      return () => JSON5.parse(re) as SqlExecSetVar[];
    }
    if (_.isArray(re)) {
      return () => _.cloneDeep(re) as SqlExecSetVar[];
    }
  }

  /**
   * 获取 SqlExecFetchBack 的构造函数
   * @param key 键名
   * @returns 构造函数或 undefined
   */
  function getSqlExecFetchBackGetter(
    key: string
  ): ((local: SqlResult, remote?: SqlResult) => SqlExecFetchBack) | undefined {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return;
    }
    if (_.isString(re)) {
      return () => JSON5.parse(re) as SqlExecFetchBack;
    }
    if (isSqlExecFetchBack(re)) {
      return () => _.cloneDeep(re) as SqlExecFetchBack;
    }
  }

  /**
   * 获取 LocalMetaPatcher
   * @param key 键名
   * @returns LocalMetaPatcher或 undefined
   */
  function getLocalMetaPatcher(key: string): LocalMetaPatcher | undefined {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return;
    }
    if (_.isString(re)) {
      return () => JSON5.parse(re) as Vars;
    }
    if (_.isObject(re)) {
      return () => _.cloneDeep(re) as Vars;
    }
    if (_.isFunction(re)) {
      return re;
    }
  }

  /**
   * 获取 LocalUpdateMetaPatcher
   * @param key 键名
   * @returns LocalUpdateMetaPatcher或 undefined
   */
  function getLocalUpdateMetaPatcher(
    key: string
  ): LocalUpdateMetaPatcher | undefined {
    let re = _.get(input, key);
    if (_.isNil(re)) {
      return;
    }
    if (_.isString(re)) {
      return () => JSON5.parse(re) as Vars;
    }
    if (_.isObject(re)) {
      return () => _.cloneDeep(re) as Vars;
    }
    if (_.isFunction(re)) {
      return re;
    }
  }

  //----------------------------------------------
  // 输出
  return {
    getString,
    getBoolean,
    getFunction,
    getKeepInfo,
    getQueryFilter,
    getQuery,
    getRdsQueryPrefixSetup,
    getSqlExecSetVarArrayGetter,
    getSqlExecFetchBackGetter,
    getLocalMetaPatcher,
    getLocalUpdateMetaPatcher,
  };
}
