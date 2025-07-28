import { Vars } from "@site0/tijs";
import _ from "lodash";

export type QueryFilter = Vars;
export type QuerySorter = Record<string, number>;

export type SqlPagerInput = {
  pageNumber: number;
  pageSize: number;
};

export type SqlPager = SqlPagerInput & {
  pageCount?: number;
  totalCount?: number;
};

export type SqlLimit = {
  limit: number;
  skip: number;
};

export type SqlResult = Record<string, any>;
export type SqlExecResult = {
  updateCount: number;
  batchResult: number[];
  batchTotal: number;
  list?: SqlResult[];
  message?: string;
};

export type SqlQuery = {
  columns?: string[] | string;
  filter: QueryFilter | QueryFilter[];
  sorter?: QuerySorter;
  pager?: SqlPager;
} & Partial<SqlLimit>;

/**
 * 执行完创建语句，还需要把这个最新的插入记录读取回来，
 * 这个对象声明了读取的方式
 */
export type SqlExecFetchBack = {
  /**
   * 表示一个 SQL 语句名称
   */
  by: string;

  /**
   * 查询语句的输入参数，通常是一个组合条件，譬如
   *
   * ```
   * {name:'litter red'}
   * ```
   * 或者多个条件
   *
   * ```
   * {name:'red', race:'dog'}
   * ```
   *
   * 给定的条件，如果查询出多个结果，服务器会抛错误
   * 考虑到有些时候，记录的字段（譬如 ID）是
   * 服务器动态生成的，在客户端没法传递，因此支持 explain 的写法:
   *
   * ```
   * {id:'=id'}
   * ```
   *
   * 这个例子表示，执行完插入语句，紧接着会从服务器的当前上下文变量里，
   * (这个变量通常是刚才执行插入的输入变量，并且已经被 `@set` 语句设置过 ID 了)
   * 直接获取 'id' 的值再查询回来
   */
  vars: Vars;

  /**
   * 如果有 fetch 的结果，结果可以暂存在【过滤管线上下文】里，
   * 注意，这个结果仅仅考虑查询回来结果集的第一个对象
   * ".." 为默认值，表示将结果对象打撒，放入【过滤管线上下文】
   * 如果指定一个名称，譬如 "pet"
   * 则表示将结果及放入【过滤管线上下文】中的 pet 键。
   * 无论怎样，都是覆盖模式的推入。
   */
  save?: string;
};

export function isSqlExecFetchBack(input: any): input is SqlExecFetchBack {
  for (let key of _.keys(input)) {
    let val = input[key];
    // 语句名称
    if ("by" == key) {
      if (!_.isString(val)) {
        return false;
      }
    }
    // 上下文变量
    else if ("vars" == key) {
      if (!_.isObject(val)) {
        return false;
      }
    }
    // 可选值
    else if (/^(save)$/.test(key)) {
      if (!_.isNil(val) && !_.isString(val)) {
        return false;
      }
    }
    // 条件
    else {
      return false;
    }
  }
  return true;
}

export type SqlExecInfo = {
  sql: string;
  // ------------------- sqlx @vars
  vars: SqlResult | SqlResult[];
  reset?: boolean;
  explain?: boolean;
  noresult?: boolean;
  omit?: string;
  pick?: string;
  put?: string;
  // ------------------- sqlx @set
  sets?: SqlExecSetVar[];
  /**
   * 执行完创建语句，还需要把这个最新的插入记录读取回来
   * 读取的方式由这个属性来指明。 这个选项的值是一个元组：
   *
   * - 1. 表示一个 SQL 语句名称
   * - 2. 这个查询语句的输入参数，通常是一个组合条件
   *
   * 组合条件就是一个查询条件表，譬如
   *
   * ```
   * {name:'litter red'}
   * ```
   * 或者多个条件
   *
   * ```
   * {name:'red', race:'dog'}
   * ```
   *
   * 给定的条件，如果查询出多个结果，服务器会抛错误
   *
   * 考虑到有些时候，记录的字段（譬如 ID）是
   * 服务器动态生成的，在客户端没法传递，因此支持 explain 的写法:
   *
   * ```
   * {id:'=id'}
   * ```
   *
   * 这个例子表示，执行完插入语句，紧接着会从服务器的上下文里，直接获取 'id' 的值，
   * 再查询回来
   */
  fetchBack?: SqlExecFetchBack;
};

export type SqlExecSetVar = {
  name: string;
  value: string;
  //to?: 'list' | 'map' | 'all';
  savepipe?: string;
  alias?: string;
  when?: any;
};

export function isSqlExecSetVar(input: any): input is SqlExecSetVar {
  for (let key of _.keys(input)) {
    if (/^(name|value)$/.test(key)) {
      let val = input[key];
      if (!_.isString(val)) {
        return false;
      }
    }
    // 可选值
    else if (/^(savepipe|alias)$/.test(key)) {
      let val = input[key];
      if (!_.isNil(val) && !_.isString(val)) {
        return false;
      }
    }
    // 条件
    else if (!/^(when)$/.test(key)) {
      return false;
    }
  }
  return true;
}

export type SqlDataVersionCheck = {
  versionUpdateVars?: Vars;
  versionCheckBy?: string;
  versionKey?: string;
  versionCurrent?: string | number;
  versionAfter?: string | number;
};

export type SqlExecOptions = SqlDataVersionCheck & {
  /**
   * 事务级别:
   *
   * - `0` : 没有事务【默认】
   * - `1` : TRANSACTION_READ_UNCOMMITTED
   * - `2` : TRANSACTION_READ_COMMITTED
   * - `4` : TRANSACTION_REPEATABLE_READ
   * - `8` : TRANSACTION_SERIALIZABLE
   *
   *
   * |No.| TRANS LEVEL                     | DR | NRR | PR |
   * |---|---------------------------------|----|-----|----|
   * | 1 | TRANSACTION_READ_UNCOMMITTED    | Y  | Y   | Y  |
   * | 2 | TRANSACTION_READ_COMMITTED      | -  | Y   | Y  |
   * | 4 | TRANSACTION_REPEATABLE_READ     | -  | -   | Y  |
   * | 8 | TRANSACTION_SERIALIZABLE        | -  | -   | -  |
   */
  transLevel?: number;

  /**
   * 如果执行错误，则在抛出前，先在控制台打印错误
   * 默认为 true，显示指定 false 关闭这个特性
   */
  logError?:boolean;
};
