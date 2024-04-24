import { QueryFilter, QuerySorter } from '..';

export type SqlNames = {
  select: string;
  update: string;
  insert: string;
  delete: string;
  count: string;
};

export type SqlPager = {
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
};

export type SqlResult = Record<string, any>;

export type SqlQuery = {
  filter: QueryFilter;
  sorter: QuerySorter;
  pager: SqlPager;
};
