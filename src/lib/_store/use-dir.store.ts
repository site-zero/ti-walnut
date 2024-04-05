import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { WnObj } from '..';
import { userDirAgg } from './dir/use-dir-agg';
import { userDirQuery } from './dir/use-dir-query';
import { useDirSetup } from './dir/use-dir-setup';
import { getLogger } from '@site0/tijs';
import { DirBaseSettings, DirBaseGetters, DirFeatures } from './dir/dir.type';
import _ from 'lodash';

const log = getLogger('wn.store.dir');

export function defineDirStore(name?: string) {
  log.debug(`defineDirStore(${name || ''})`);
  return defineStore(name || 'CurrentDir', (): DirFeatures => {
    log.info(`defineStore(${name || 'CurrentDir'})`);
    let _dir = useDirSetup();
    let _query = userDirQuery(_dir);
    let _agg = userDirAgg({
      ..._dir,
      ..._query,
    });

    async function reload(obj?: WnObj) {
      await _dir.loadDirSettings(obj);
      await _query.queryList();
    }

    return {
      ..._dir,
      ..._query,
      ..._agg,
      reload,
    };
  });
}
