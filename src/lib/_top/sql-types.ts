import { NameAnyValue } from '@site0/tijs';
import { QueryFilter, QuerySorter } from '..';

export type SqlPager = {
  pageNumber: number;
  pageSize: number;
  pageCount?: number;
  totalCount?: number;
};

export type SqlLimit = {
  limit: number;
  skip: number;
};

export type SqlResult = Record<string, any>;

export type SqlQuery = {
  filter: QueryFilter;
  sorter: QuerySorter;
  pager: SqlPager;
};

/**
 * 创建记录时的配置
 */
export type SqlExecOptions = {
  /**
   * 执行完创建语句，还需要把这个最新的插入记录读取回来
   * 读取的方式由这个属性来指明，譬如
   *
   * ```
   * {name:'nickname', value:'litter red'}
   * ```
   * 或者，联合主键
   *
   * ```
   * [{name:'nickname', value:'red'},{name:'race', value:'dog'}]
   * ```
   *
   * 给定的条件，如果查询出多个结果，服务器会抛错误
   *
   * 考虑到有些时候，记录的字段（譬如 ID）是
   * 服务器动态生成的，在客户端没法传递，因此支持 explain 的写法:
   *
   * ```
   * {name:'id', value:'=id'}
   * ```
   *
   * 这个例子表示，执行完插入语句，紧接着会从服务器的上下文里，直接获取 'id' 的值，
   * 再查询回来
   */
  fetchBack?: NameAnyValue | NameAnyValue[];
};