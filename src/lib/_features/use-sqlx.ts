import { Vars, getLogger } from '@site0/tijs';
import _ from 'lodash';
import {
  QueryFilter,
  SqlExecOptions,
  SqlLimit,
  SqlPager,
  SqlQuery,
  SqlResult,
} from '..';
import { Walnut } from '../../core';

const log = getLogger('wn.use-sqlx');

export function useSqlx(daoName?: string) {
  /**
   * 封装 SQL 的查询
   *
   * @param sql SQL 模板名称
   * @param query 查询条件
   */
  async function fetch(
    sql: string,
    filter: QueryFilter
  ): Promise<SqlResult | undefined> {
    // 确保查询结果不要超过2个
    let query = {
      filter: filter,
      sorter: {},
      pager: {
        pageNumber: 1,
        pageSize: 2,
      },
    } as SqlQuery;

    // 执行查询
    let list = await select(sql, query);

    // 处理结果
    if (_.isArray(list) && list.length > 0) {
      return list[0] as SqlResult;
    }
  }
  /**
   * 封装 SQL 的查询
   *
   * @param sql SQL 模板名称
   * @param query 查询条件
   */
  async function select(sql: string, query: SqlQuery): Promise<SqlResult[]> {
    // 准备查询上下文
    let q = {
      filter: query.filter,
      sorter: query.sorter,
      ...pagerToLimit(query.pager),
    } as Vars;

    let qstr = JSON.stringify(q);

    // 准备命令
    let cmds = [`sqlx`];
    if (daoName) {
      cmds.push(daoName);
    }
    cmds.push('-cqn @vars');
    cmds.push(`@query ${sql} -p`);
    let cmdText = cmds.join(' ');
    log.debug(cmdText, q);

    // 执行查询
    let list = await Walnut.exec(cmdText, { input: qstr, as: 'json' });

    // 处理结果
    return list as SqlResult[];
  }

  async function exec(
    sql: string,
    vars: Vars,
    _optons: SqlExecOptions
  ): Promise<SqlResult> {
    // 准备命令
    let cmds = [`sqlx`];
    if (daoName) {
      cmds.push(daoName);
    }
    cmds.push('-cqn @vars');
    cmds.push(`@exec ${sql}`);
    let cmdText = cmds.join(' ');
    log.debug(cmdText);

    // 执行查询
    let input = JSON.stringify(vars);
    let reo = await Walnut.exec(cmdText, { input, as: 'json' });

    // 处理结果
    return reo as SqlResult;
  }

  //-------------< Output Feature >------------------
  return { select, fetch, exec };
}

function pagerToLimit(pager: SqlPager): SqlLimit {
  return {
    limit: pager.pageSize,
    skip: Math.max(0, pager.pageSize * (pager.pageNumber - 1)),
  };
}
