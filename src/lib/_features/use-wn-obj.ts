import { Util, Vars } from '@site0/tijs';
import { Walnut, WalnutServer, WnObjInfo } from '../../..';
import { WnObj, WnMetaSaving } from '../_top';
import _ from 'lodash';

export type WnObjFeature = WnMetaSaving & {
  fetch: (path: string) => Promise<WnObj | undefined>;
  get: (id: string) => Promise<WnObj | undefined>;
  writeText: (path: string, content: string) => Promise<WnObj>;
  loadContent: (path: string) => Promise<string>;
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

export function useWnObj(homePath: string = '~'): WnObjFeature {
  const _home_path = homePath.replace(/'/g, '');
  /**
   * @param path 对象路径
   * @returns 对象解析后的内容
   */
  async function fetch(path: string): Promise<WnObj | undefined> {
    // 去掉危险的字符串
    let aph = path.replace(/'/g, '');
    // 确保是绝对路径
    if (!/^[~/]/.test(aph)) {
      aph = Util.appendPath(_home_path, aph);
    }
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
   * @param meta 要更新的原数据，必须包含 id 字段以便确定更新目标
   * @returns 更新后对象
   */
  async function update(meta: Vars): Promise<WnObj | undefined> {
    let id = meta.id;
    // 防守一下
    if (!id) {
      throw `update obj need 'id' in meta!`;
    }
    let theId = id.replace(/'/g, '');
    let input = JSON.stringify(_.omit(meta, ...BUILD_IN_KEYS));
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
    let input = JSON.stringify(_.omit(meta, 'pid', ...BUILD_IN_KEYS));
    let cmdText = `o @create -p '${parentPath}' @json -cqn`;
    let re = await Walnut.exec(cmdText, { as: 'json', input });
    return re ?? undefined;
  }

  async function writeText(path: string, content: string): Promise<WnObj> {
    let url = `/o/content?str=${path}`;
    let re = await Walnut.postFormToGetJson(url, { content });
    return re;
  }

  async function loadContent(path: string): Promise<string> {
    let url = `/o/content?str=${path}`;
    let re = await Walnut.fetchText(url);
    return re;
  }

  //---------------------------------------------
  //                输出特性
  //---------------------------------------------
  return {
    fetch,
    get,
    update,
    create,
    writeText,
    loadContent,
  };
}
