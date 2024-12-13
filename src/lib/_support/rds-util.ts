import _ from 'lodash';
import { SqlLimit, SqlPager, SqlQuery } from '../_types';

export function updatelPager(pager: SqlPager, update: Partial<SqlPager>) {
  let { pageNumber, pageSize, totalCount } = update;
  if (_.isNumber(pageNumber)) {
    pager.pageNumber = pageNumber;
  }
  if (_.isNumber(pageSize)) {
    pager.pageSize = pageSize;
  }
  if (_.isNumber(totalCount)) {
    updatePagerTotal(pager, totalCount);
  }
}

export function getQueryLimit(query: SqlQuery): SqlLimit {
  if (_.isNumber(query.limit) && query.limit > 0) {
    return {
      limit: query.limit,
      skip: query.skip ?? 0,
    };
  }
  if (query.pager) {
    return pagerToLimit(query.pager);
  }
  return {
    limit: 10,
    skip: 0,
  };
}

function pagerToLimit(pager: SqlPager): SqlLimit {
  return {
    limit: pager.pageSize,
    skip: Math.max(0, pager.pageSize * (pager.pageNumber - 1)),
  };
}

export function updatePagerTotal(pager: SqlPager, total: number) {
  pager.totalCount = total;
  pager.pageCount = Math.ceil(total / pager.pageSize);
}
