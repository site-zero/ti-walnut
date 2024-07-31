import { Vars } from '@site0/tijs';
import { QueryFilter, QuerySorter } from '..';

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
  filter: QueryFilter | QueryFilter[];
  sorter: QuerySorter;
  pager: SqlPager;
};

export type SqlExecInfo = {
  sql: string;
  // ------------------- sqlx @vars
  vars: SqlResult | SqlResult[];
  reset?: boolean;
  explain?: boolean;
  noresult?: boolean;
  omit?: string;
  pick?: string;
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
  fetchBack?: [string, Vars?];
};

export type SqlExecSetVar = {
  name: string;
  value: string;
  to?: 'list' | 'map' | 'all';
};

export type SqlExecOptions = {
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
};
