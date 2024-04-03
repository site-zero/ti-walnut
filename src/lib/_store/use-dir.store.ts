import { defineStore } from 'pinia';
import { ref } from 'vue';
import { WnObj } from '..';
import { userDirAgg } from './support/use-dir-agg';
import { userDirQuery } from './support/use-dir-query';

export function defineDirStore(name?: string) {
  return defineStore(name || 'CurrentDir', () => {
    let oHome = ref<WnObj>();
    let _query = userDirQuery(oHome);
    let _agg = userDirAgg(_query);

    async function reloadData() {
      await _query.queryList();
    }

    async function reload(o_dir?: WnObj) {
      oHome.value = o_dir;
      await reloadData()
    }

    return {
      oHome,
      ..._query,
      ..._agg,
      reload,
      reloadData,
    };
  });
}
