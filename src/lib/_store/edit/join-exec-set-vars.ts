import _ from 'lodash';
import { SqlExecSetVar } from '../../_types';

export type SqlInsertSet =
  | SqlExecSetVar
  | SqlExecSetVar[]
  | (() => SqlExecSetVar[] | SqlExecSetVar | undefined);

export function join_exec_set_vars(
  sets: SqlExecSetVar[],
  insertSet?: SqlInsertSet
) {
  // 防空
  if (!insertSet) {
    return;
  }
  let tidiedSet: SqlExecSetVar[] | SqlExecSetVar | undefined = undefined;
  // 定制函数
  if (_.isFunction(insertSet)) {
    tidiedSet = insertSet();
  }
  // 直接指定的数值
  else {
    tidiedSet = insertSet;
  }

  // 数组
  if (_.isArray(tidiedSet)) {
    sets.push(...tidiedSet);
  }
  // 只有一个对象
  else if (tidiedSet) {
    sets.push(tidiedSet);
  }
}
