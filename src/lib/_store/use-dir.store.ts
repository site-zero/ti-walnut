import { getLogger } from '@site0/tijs';
import { defineStore } from 'pinia';
import { WnObj } from '..';
import { DirFeatures } from './dir/dir.type';
import { userDirAgg } from './dir/use-dir-agg';
import { useDirInit } from './dir/use-dir-init';
import { userDirQuery } from './dir/use-dir-query';
import { useDirView } from './dir/use-dir-view';
import { useDirKeep } from './dir/use-dir-keep';

const log = getLogger('wn.pinia.dir');

export function defineDirStore(name?: string) {
  log.debug(`defineDirStore(${name || ''})`);
  return defineStore(name || 'CurrentDir', (): DirFeatures => {
    log.info(`defineStore(${name || 'CurrentDir'})`);
    let _dir = useDirInit();
    let _keep = useDirKeep();
    let _view = useDirView(_dir);
    let _query = userDirQuery(_dir);
    let _agg = userDirAgg({
      ..._dir,
      ..._query,
    });
    return {
      ..._dir,
      ..._query,
      ..._agg,
      keepState: () => {
        _keep.saveToLocal({
          ..._view,
          ..._query,
        });
      },
      reload: async (obj?: WnObj) => {
        await _dir.initDirSettings(obj);

        _view.resetView();
        _query.resetQuery();
        _agg.resetAgg();

        await _view.loadView();

        _view.applyView(_dir.behaviors.value, {
          ..._query,
          ..._agg,
        });

        _keep.restoreFromLocal({
          ..._view,
          ..._query,
        });

        await _query.queryList();
        if (_agg.aggAutoReload.value) {
          await _agg.loadAggResult();
        }
      },
    };
  });
}
