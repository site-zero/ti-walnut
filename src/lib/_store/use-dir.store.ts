import { getLogger } from '@site0/tijs';
import { defineStore } from 'pinia';
import { WnObj } from '..';
import { DirFeatures } from './dir/dir.type';
import { userDirAgg } from './dir/use-dir-agg';
import { userDirQuery } from './dir/use-dir-query';
import { useDirInit } from './dir/use-dir-init';

const log = getLogger('wn.store.dir');

export function defineDirStore(name?: string) {
  log.debug(`defineDirStore(${name || ''})`);
  return defineStore(name || 'CurrentDir', (): DirFeatures => {
    log.info(`defineStore(${name || 'CurrentDir'})`);
    let _dir = useDirInit();
    let _query = userDirQuery(_dir);
    let _agg = userDirAgg({
      ..._dir,
      ..._query,
    });
    return {
      ..._dir,
      ..._query,
      ..._agg,
      reload: async (obj?: WnObj) => {
        await _dir.initDirSettings(obj);
        await _query.queryList();
      },
    };
  });
}
