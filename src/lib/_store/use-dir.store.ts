import { defineStore } from 'pinia';
import { ref } from 'vue';
import { WnObj } from '..';
import { userDirAgg } from './dir/use-dir-agg';
import { userDirQuery } from './dir/use-dir-query';
import { useDirSetup } from './dir/use-dir-setup';
import { getLogger } from '@site0/tijs';

const log = getLogger('wn.store.dir');

export function defineDirStore(name?: string) {
  log.debug(`defineDirStore(${name || ''})`);
  return defineStore(name || 'CurrentDir', () => {
    log.info(`defineStore(${name || 'CurrentDir'})`);
    let _setup = useDirSetup();
    let _query = userDirQuery(_setup);
    let _agg = userDirAgg({
      fixedMatch: _query.fixedMatch,
      filter: _query.filter,
      homeIndexId: _setup.homeIndexId,
      isHomeExists: _setup.isHomeExists,
    });

    async function reload(o_dir?: WnObj) {
      await _setup.loadGUISettings(o_dir);
      await _query.queryList();
    }

    return {
      ..._setup,
      ..._query,
      ..._agg,
      reload,
    };
  });
}
