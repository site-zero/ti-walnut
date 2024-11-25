import { Vars } from '@site0/tijs';
import _ from 'lodash';
import { Walnut } from '../../..';
import { WnObj, WnMetaSaving } from '../_types';

export type ThingFeature = WnMetaSaving & {
  get: (id: string) => Promise<WnObj | undefined>;
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

/**
 * 定义数据集访问特性
 *
 * @param thSetIdOrPath
 * @returns 数据集访问特性
 */
export function useThing(thSetIdOrPath: string): ThingFeature {
  const _th_set = thSetIdOrPath.replace(/'/g, '');

  /**
   * @param path 对象路径
   * @returns 对象解析后的内容
   */
  async function get(id: string): Promise<WnObj | undefined> {
    // 去掉危险的字符串
    let theId = id.replace(/'/g, '');
    let cmdText = `thing ${_th_set} get '${theId}'  -cqn`;
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
      throw `update thing need 'id' in meta!`;
    }
    let theId = id.replace(/'/g, '');
    let input = JSON.stringify(_.omit(meta, ...BUILD_IN_KEYS));
    let cmdText = `thing ${_th_set} update '${theId}' -fields -cqn`;
    let re = await Walnut.exec(cmdText, { as: 'text', input });
    if (re.startsWith('{') && re.endsWith('}')) {
      return JSON.parse(re);
    }
    return undefined;
  }

  /**
   * @param meta 要更新的原数据，必须包含 pid 字段以便确定要创建的目标目录
   * @returns 创建后对象
   */
  async function create(meta: Vars): Promise<WnObj | undefined> {
    let input = JSON.stringify(_.omit(meta, 'pid', ...BUILD_IN_KEYS));
    let cmdText = `thing ${_th_set} create -fields -cqn`;
    let re = await Walnut.exec(cmdText, { as: 'json', input });
    return re ?? undefined;
  }

  //---------------------------------------------
  //                输出特性
  //---------------------------------------------
  return {
    get,
    update,
    create,
  };
}
