import { getLogger, Util, Vars } from '@site0/tijs';
import _ from 'lodash';
import {
  getQueryLimit,
  QueryFilter,
  SqlExecInfo,
  SqlExecOptions,
  SqlExecResult,
  SqlQuery,
  SqlResult,
} from '..';
import { Walnut } from '../../core';

const log = getLogger('wn.use-sqlx');

export type SqlXApi = ReturnType<typeof defineSqlx>;

const _SQLX = new Map<string, SqlXApi>();

/**
 * 获取一个 SQLX 的 API
 *
 * @param daoName DAO 的名称
 * @returns SQLX 的 API
 */
export function useSqlx(daoName?: string): SqlXApi {
  let xkey = daoName ?? '__sqlx_default__';
  let api = _SQLX.get(xkey);
  if (!api) {
    api = defineSqlx(daoName);
    _SQLX.set(xkey, api);
  }
  return api;
}

/**
 * 定义 SQLX 操作的封装函数
 *
 * @param daoName 可选的 DAO 名称
 * @returns 包含 select、fetch、count 和 exec 等方法的接口对象
 */
export function defineSqlx(daoName?: string) {
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
    // 执行查询
    let list = await __query(sql, filter);

    // 处理结果
    if (_.isArray(list)) {
      if (list.length == 1) {
        return list[0] as SqlResult;
      } else if (list.length > 1) {
        log.error(`Multiple result when fetch`, { sql, filter, list });
      }
    }
  }
  async function __query(sql: string, q: Vars): Promise<SqlResult[]> {
    try {
      let qobj = Util.filterRecordNilValueDeeply(q);
      let qstr = JSON.stringify(qobj);

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
      console.error(`Invalid [${sql}]`, q);
      console.error(err);
      throw err;
    }
  }

  /**
   * 封装 SQL 的查询
   *
   * @param sql SQL 模板名称
   * @param query 查询条件
   * @returns 查询结果
   */
  async function query(sql: string, query: SqlQuery): Promise<SqlResult[]> {
    // 准备查询上下文
    let q = {
      filter: query.filter,
      sorter: query.sorter,
      ...getQueryLimit(query),
    } as Vars;
    if (query.columns) {
      q.columns = _.concat(query.columns).join(',');
    }

    return await __query(sql, q);
  }

  /**
   * 封装 SQL 的查询
   *
   * @param sql SQL 模板名称
   * @param query 查询条件
   * @returns 查询结果
   */
  async function select(sql: string, q: Vars): Promise<SqlResult[]> {
    // 准备查询上下文
    return await __query(sql, q);
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
      let qobj = Util.filterRecordNilValueDeeply(filter);
      let qstr = JSON.stringify(qobj);

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
   * @param infos  执行的具体细节
   * @returns 执行结果
   */
  async function exec(
    infos: SqlExecInfo | SqlExecInfo[],
    options: SqlExecOptions = {}
  ): Promise<SqlExecResult | undefined> {
    let inputs = {} as Vars;
    let opts = _.concat(infos);
    // 准备命令
    let cmds = [`sqlx`];
    if (daoName) {
      cmds.push(daoName);
    }
    cmds.push('-cqn');

    // 开启事务
    let tl = options?.transLevel ?? 0;
    if (tl > 0) {
      cmds.push('@trans');
      // 快速判断给定的事物级别是否是1248其中的一个
      if ((tl & 15) === tl) {
        cmds.push(`-level ${tl}`);
      }
    }

    // 逐个处理执行对象
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
      if (opt.put) {
        cmds.push(`-put '${opt.put}'`);
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
          if (_.isArray(opt.vars)) {
            cmds.push('-to list');
          } else {
            cmds.push('-to map');
          }
          if (se.savepipe) {
            cmds.push(`-savepipe '${se.savepipe}'`);
          }
          if (se.alias) {
            cmds.push(`-alias '${se.alias}'`);
          }
          if (se.when) {
            cmds.push(`-when '${JSON.stringify(se.when).replace("'", '')}'`);
          }
        }
      }
      //............. @exec
      cmds.push(`@exec ${opt.sql}`);
      if (opt.noresult) {
        cmds.push('-noresult');
      }
      // 如果需要输出结果，则看看是否需要回查
      else if (opt.fetchBack && opt.fetchBack.by) {
        let { by, vars, save } = opt.fetchBack;
        cmds.push(`-fetch_by ${by}`);
        if (vars && !_.isEmpty(vars)) {
          cmds.push(`-fetch_vars '${JSON.stringify(vars)}'`);
        }
        if (save) {
          cmds.push(`-fetch_save '${save}'`);
        }
      }
    }

    // 准备发送命令
    let cmdText = cmds.join(' ');
    log.debug(cmdText);

    // 执行查询
    let input = JSON.stringify(inputs);
    try {
      let reo = await Walnut.exec(cmdText, { input, as: 'json' });

      // 错误
      if (!_.isPlainObject(reo) && !_.isArray(reo)) {
        return;
      }

      // 处理结果
      if (reo) {
        return reo as SqlExecResult;
      }
    } catch (err) {
      console.error(`use-sqlx: ${cmdText}`, err, inputs);
      throw err;
    }
  }

  //-------------< Output Feature >------------------
  return { query, fetch, select, count, exec };
}
