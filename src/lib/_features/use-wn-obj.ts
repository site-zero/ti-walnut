import { Util, Vars } from '@site0/tijs';
import JSON5 from 'json5';
import _ from 'lodash';
import {
  genWnPath,
  getQueryLimit,
  QueryFilter,
  SqlPager,
  SqlQuery,
  Walnut,
  WnObjInfo,
  WnObjQueryOptions,
} from '../../..';
import { WnMetaSaving, WnObj } from '../_types';

export type WnObjFeature = WnMetaSaving & ReturnType<typeof useWnObj>;

export type WnLoadContentOptions = {
  as?: 'text' | 'json';
};

const BUILD_IN_KEYS = [
  'id',
  'ph',
  'ct',
  'lm',
  'c',
  'm',
  'md',
  'g',
  'race',
  'd0',
  'd1',
  'sha1',
  'len',
  'ct',
  'lm',
];

export function useWnObj(homePath: string = '~') {
  const _home_path = homePath.replace(/'/g, '');
  /**
   * @param path 对象路径
   * @returns 对象解析后的内容
   */
  async function fetch(path: string): Promise<WnObj | undefined> {
    // 去掉危险的字符串
    let aph = genWnPath(_home_path, path);

    let cmdText = `o @fetch -ignore '${aph}'  @json -cqn`;
    let re = await Walnut.exec(cmdText, { as: 'json' });
    return re ?? undefined;
  }

  /**
   * @param path 对象路径
   * @returns 对象解析后的内容
   */
  async function get(id: string): Promise<WnObj | undefined> {
    // 去掉危险的字符串
    let theId = id.replace(/'/g, '');
    let cmdText = `o @get -ignore '${theId}'  @json -cqn`;
    let re = await Walnut.exec(cmdText, { as: 'json' });
    return re ?? undefined;
  }

  /**
   * @param path 对象路径
   * @returns 对象解析后的内容
   */
  async function remove(...ids: string[]) {
    let cmds = ['o @get -ignore'];
    for (let id of ids) {
      // 去掉危险的字符串
      let theId = id.replace(/'/g, '');
      cmds.push(theId);
    }
    cmds.push(`@delete`);
    let cmdText = cmds.join(' ');
    await Walnut.exec(cmdText, { as: 'json' });
  }

  /**
   * @param meta 要更新的原数据，必须包含 id 字段以便确定更新目标
   * @returns 更新后对象
   */
  async function update(meta: Vars): Promise<WnObj | undefined> {
    let id = meta.id;
    // 防守一下
    if (!id) {
      throw `update obj need 'id' in meta!`;
    }
    // 确保，防止命令注入
    let theId = id.replace(/['/\\]/g, '');

    // 准备元数据
    let newMeta: Vars = _.omit(meta, ...BUILD_IN_KEYS);

    // 准备输入
    let input = JSON.stringify(newMeta);
    let cmdText = `o @get -ignore '${theId}' @update  @json -cqn`;
    let re = await Walnut.exec(cmdText, { as: 'json', input });
    return re ?? undefined;
  }

  /**
   * @param meta 要更新的原数据，如果包含 pid 字段可以指定任意的父路径
   * @returns 创建后对象
   */
  async function create(meta: Vars): Promise<WnObj | undefined> {
    let pid = meta.pid;
    let parentPath = _home_path;
    // 指定了父路径
    if (pid) {
      let theParentId = pid.replace(/'/g, '');
      parentPath = `id:${theParentId}`;
    }

    // 准备元数据
    let newMeta: Vars = _.omit(meta, ...BUILD_IN_KEYS);
    newMeta.race = meta.race ?? 'FILE';

    // 准备输入
    let input = JSON.stringify(newMeta);
    let cmdText = `o @create -p '${parentPath}' @json -cqn`;
    let re = await Walnut.exec(cmdText, { as: 'json', input });
    if (re) {
      return _.omit(re, '__is_created');
    }
    return undefined;
  }

  async function query(
    parentPathOrDir: WnObj | string,
    _q: SqlQuery,
    options: WnObjQueryOptions = {}
  ): Promise<[WnObj[], SqlPager]> {
    let list: WnObj[] = [];
    let page: SqlPager = {
      pageNumber: 0,
      pageSize: 0,
      pageCount: 0,
      totalCount: 0,
    };

    // 准备查询条件
    // [{..}]          # 可多个条件，为 OR 的关系
    let qs = JSON.stringify(_q.filter ?? {});

    // 准备命令
    var cmds = ['o @query'];
    // [-p ~/xxx]      # 指定一个父节点
    if (parentPathOrDir) {
      // 字符串，一定是路径
      if (_.isString(parentPathOrDir)) {
        let pph = genWnPath(_home_path, parentPathOrDir);
        cmds.push(`-p '${pph}'`);
      }
      // 指定了一个对象
      else if (parentPathOrDir.id) {
        cmds.push(`-p 'id:${parentPathOrDir.id}'`);
      }
    }

    // [-sort {ct:1}]  # 排序方式
    if (_q.sorter) {
      cmds.push(`-sort '${JSON.stringify(_q.sorter)}'`);
    }

    // [-mine]         # 为条件添加 d0:"home", d1:"主组" 两条约束
    if (false !== options.mine) {
      cmds.push('-mine');
    }
    // [-hidden]       # 如果有隐藏对象，也要输出出来
    if (options.hidden) {
      cmds.push('-hidden');
    }
    // [-quiet]        # 如果指定的父节点不存在，不要抛错，直接静默忍耐
    if (options.quiet) {
      cmds.push('-quiet');
    }
    // [-pager]        # 表示要记录翻页信息
    if (_q.pager) {
      cmds.push('-pager');
      let ls = getQueryLimit(_q);

      // [-limit 10]     # 最多多少条记录
      if (ls.limit > 0) {
        cmds.push(`-limit ${ls.limit}`);
      }

      // [-skip 0]       # 跳过多少条记录
      if (ls.skip > 0) {
        cmds.push(`-skip ${ls.skip}`);
      }
    }
    // [-path]         # 确保每个查询出来的对象是有全路径属性的
    if (options.loadPath) {
      cmds.push('-path');
    }

    let cmdText = cmds.join(' ');

    let reo = await Walnut.exec(cmdText, { input: qs, as: 'json' });
    list = reo.list || [];
    page.pageNumber = reo.pager.pageNumber;
    page.pageSize = reo.pager.pageSize;
    page.pageCount = reo.pager.pageCount;
    page.totalCount = reo.pager.totalCount;

    return [list, page];
  }

  async function queryChildren(q: SqlQuery, options?: WnObjQueryOptions) {
    return query(_home_path, q, options);
  }

  async function getChild(filterOrName: string | QueryFilter) {
    let q: SqlQuery = {
      filter: {},
      sorter: { ct: -1 },
      pager: { pageSize: 1, pageNumber: 1 },
    };
    // 查对象名称
    if (_.isString(filterOrName)) {
      _.assign(q.filter, { nm: filterOrName });
    }
    // 更多设置
    else {
      _.assign(q.filter, filterOrName);
    }

    let [objs] = await queryChildren(q, {
      hidden: true,
      loadPath: true,
      quiet: true,
    });
    if (objs.length > 0) {
      return objs[0];
    }
    return null;
  }

  async function writeText(path: string, content: string): Promise<WnObj> {
    let url = `/o/save/text?str=${path}`;
    let re = await Walnut.postFormToGetAjax(url, { content });
    return re.data;
  }

  async function loadContent(
    path: string,
    options: WnLoadContentOptions = {}
  ): Promise<any> {
    let { as = 'text' } = options;
    let url = `/o/content?str=${path}`;
    let re = await Walnut.fetchText(url);
    if (_.isNil(re)) {
      return re;
    }
    if ('json' == as) {
      return JSON5.parse(re);
    }
    return re;
  }

  async function rename(
    info: WnObjInfo,
    newName: string
  ): Promise<WnObj | undefined> {
    let { id, ph } = info;
    let cmds = [`rename -cqno`];
    if (id) {
      // 去掉危险的字符串
      let objId = id.replace(/'/g, '');
      cmds.push(`-id '${objId}'`);
    } else if (ph) {
      // 去掉危险的字符串
      let aph = ph.replace(/'/g, '');
      // 确保是绝对路径
      if (!/^[~/]/.test(aph)) {
        aph = Util.appendPath(_home_path, aph);
      }
      cmds.push(`'${aph}'`);
    }
    // 没有足够
    else {
      return;
    }
    cmds.push(`'${newName}'`);

    let cmdText = cmds.join(' ');
    let re = await Walnut.exec(cmdText);
    re = _.trim(re);
    if (re && !/^e./.test(re)) {
      return JSON5.parse(re);
    }
  }

  //---------------------------------------------
  //                输出特性
  //---------------------------------------------
  return {
    fetch,
    get,
    remove,
    update,
    create,
    query,
    queryChildren,
    getChild,
    writeText,
    loadContent,
    rename,
  };
}
