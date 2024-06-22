import { Vars, getLogger } from '@site0/tijs';
import JSON5 from 'json5';
import _ from 'lodash';
import {
  QueryFilter,
  SqlExecOptions,
  SqlExecResult,
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
   * @returns 查询结果
   */
  async function select(sql: string, query: SqlQuery): Promise<SqlResult[]> {
    // 准备查询上下文
    let q = {
      filter: query.filter,
      sorter: query.sorter,
      ...pagerToLimit(query.pager),
    } as Vars;

    try {
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

      // 错误
      if (!_.isArray(list)) {
        return [];
      }

      // 处理结果
      return list as SqlResult[];
    } catch (err) {
      console.warn(`Invalid [${sql}]`, query);
      throw err;
    }
  }

  /**
   * 获取符合查询条件的记录数量
   *
   * @param sql SQL 模板名称
   * @param query 查询条件
   * @param countKey 查询结果中哪个键是用来获取统计结果的，默认`total`
   * @returns 符合查询条件的记录数量
   */
  async function count(
    sql: string,
    filter: QueryFilter,
    countKey: string = 'total'
  ): Promise<number> {
    try {
      let qstr = JSON.stringify(filter);

      // 准备命令
      let cmds = [`sqlx`];
      if (daoName) {
        cmds.push(daoName);
      }
      cmds.push('-cqn @vars');
      cmds.push(`@query ${sql} -p`);
      let cmdText = cmds.join(' ');
      log.debug(cmdText, filter);

      // 执行查询
      let list = await Walnut.exec(cmdText, { input: qstr, as: 'json' });

      // 错误
      if (!_.isArray(list)) {
        return -1;
      }

      // 处理结果
      if (list.length == 0) {
        return 0;
      }

      return list[0][countKey] ?? 0;
    } catch (err) {
      console.warn(`Invalid [${sql}]`, filter);
      throw err;
    }
  }

  /**
   * 封装 SQL 的执行
   * @param options  执行的具体细节
   * @returns 执行结果
   */
  async function exec(
    options: SqlExecOptions | SqlExecOptions[]
  ): Promise<SqlExecResult | undefined> {
    let inputs = {} as Vars;
    let opts = _.concat(options);
    // 准备命令
    let cmds = [`sqlx`];
    if (daoName) {
      cmds.push(daoName);
    }
    cmds.push('-cqn');
    for (let i = 0; i < opts.length; i++) {
      let opt = opts[i];
      // 准备输入
      inputs[`I${i}`] = opt.vars;

      //............. @vars
      cmds.push(`@vars '=I${i}'`);
      if (opt.reset) {
        cmds.push('-reset');
      }
      if (opt.explain) {
        cmds.push('-explain');
      }
      if (_.isArray(opt.vars)) {
        cmds.push('-as list');
      } else {
        cmds.push('-as map');
      }
      if (opt.omit) {
        cmds.push(`-omit '${opt.omit}'`);
      }
      if (opt.pick) {
        cmds.push(`-pick '${opt.pick}'`);
      }
      //............. @set
      if (opt.sets) {
        for (let se of opt.sets) {
          cmds.push(`@set ${se.name} '${se.value}'`);
          if (se.to) {
            cmds.push(`-to ${se.to}`);
          }
        }
      }
      //............. @exec
      cmds.push(`@exec ${opt.sql}`);
      if (opt.noresult) {
        cmds.push('-noresult');
      }
      // 如果需要输出结果，则看看是否需要回查
      else if (opt.fetchBack) {
        let [by, vars] = opt.fetchBack;
        cmds.push(`-fetch_by ${by}`);
        if (vars && !_.isEmpty(vars)) {
          cmds.push(`-fetch_vars '${JSON5.stringify(vars)}'`);
        }
      }
    }

    // 准备发送命令
    let cmdText = cmds.join(' ');
    log.debug(cmdText);

    // 执行查询
    let input = JSON.stringify(inputs);
    let reo = await Walnut.exec(cmdText, { input, as: 'json' });

    // 错误
    if (!_.isPlainObject(reo) && !_.isArray(reo)) {
      return;
    }

    // 处理结果
    if (reo) {
      return reo as SqlExecResult;
    }
    return;
  }

  //-------------< Output Feature >------------------
  return { select, fetch, count, exec };
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
