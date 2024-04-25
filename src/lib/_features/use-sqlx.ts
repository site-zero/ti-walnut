import { getLogger } from '@site0/tijs';
import { SqlNames, SqlQuery, SqlResult } from '..';
import { Walnut } from '../../core';

const log = getLogger('wn.use-sqlx');

export function createDefaultSqlNames(prefix?: string): SqlNames {
  const _gen = function (key: string) {
    if (prefix) {
      return `${prefix}.${key}`;
    }
    return key;
  };
  return {
    select: _gen('select'),
    update: _gen('update'),
    insert: _gen('insert'),
    delete: _gen('delete'),
    count: _gen('count'),
  };
}

export function useSqlx(daoName?: string) {
  /**
   * 封装 SQL 的查询
   *
   * @param sql SQL 模板名称
   * @param query 查询条件
   */
  async function select(sql: string, query: SqlQuery): Promise<SqlResult[]> {
    // 准备查询上下文
    let qstr = JSON.stringify(query);
    let cmds = [`sqlx`];
    if (daoName) {
      cmds.push(daoName);
    }
    cmds.push('-cqn @vars');
    cmds.push(`@query ${sql} -p`);
    let cmdText = cmds.join(' ');
    if (log.isInfoEnabled()) {
      log.info(cmdText);
    }
    let list = await Walnut.exec(cmdText, { input: qstr, as: 'json' });
    return list as SqlResult[];
  }

  return { select };
}
