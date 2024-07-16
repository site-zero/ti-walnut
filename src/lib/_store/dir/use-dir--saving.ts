import _ from 'lodash';
import { DirInnerContext } from './dir.type';
import { WnMetaSaving } from '../../../..';
import { useThing } from '../../_features/use-thing';
import { useWnObj } from '../../_features/use-wn-obj';

export function useDirSaving(context: DirInnerContext): WnMetaSaving {
  let { _dir } = context;
  // ThingSet
  if (_dir.isThingSet.value) {
    return useThing(`id:${_dir.homeId.value}`);
  }
  // 普通目录
  return useWnObj(`id:${_dir.homeId.value}`);
}
