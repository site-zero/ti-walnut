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
