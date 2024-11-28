import { Util } from '@site0/tijs';
import { WnObj, WnRace } from '../../..';
import { Walnut } from '../../../../core';

export async function auto_create_obj(
  path: string,
): Promise<WnObj> {
  let parentPath = Util.getParentPath(path);
  let name = Util.getFileName(path);

  let cmdText = [
    `o  @create -auto -upsert`,
    `-p '${parentPath}'`,
    `-race DIR`,
    `'${name}' @json -cqn`,
  ].join(' ');

  let obj = await Walnut.exec(cmdText, { as: 'json' });
  if (!obj) {
    throw `auto_create_obj failed: ${cmdText}`;
  }
  return obj;
}
