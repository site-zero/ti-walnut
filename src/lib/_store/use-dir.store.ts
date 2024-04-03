import { ShortNamePager, Vars } from '@site0/tijs';
import { defineStore } from 'pinia';
import { WnObj } from '..';

export function defineDirStore(name: string = 'CurrentDir') {
  return defineStore(name, () => {});
}
