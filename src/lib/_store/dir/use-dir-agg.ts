import { Match, getLogger } from '@site0/tijs';
import JSON5 from 'json5';
import _ from 'lodash';
import { ref } from 'vue';
import { Walnut } from '../../../core';
import {
  AggQuery,
  AggResult,
  DirAggFeature,
  DirInitFeature,
  DirQuerySettings,
  QueryFilter,
} from './dir.type';

const log = getLogger('wn.store.dir.agg');

export type AggOptions = Pick<DirInitFeature, 'homeIndexId' | 'isHomeExists'> &
  Pick<DirQuerySettings, 'fixedMatch' | 'filter'>;

export function userDirAgg(options: AggOptions) {
  log.debug('userDirAgg');
  // Prepare data
  let hasDir = options.isHomeExists;
  let dirId = options.homeIndexId;
  let aggQuery = ref<string>();
  let aggSet = ref<Record<string, AggQuery>>({});
  let aggAutoReload = ref<boolean>(false);
  let aggResult = ref<AggResult>();

  // -----------------------------------------------
  // Actions
  // -----------------------------------------------

  function resetAgg() {
    log.debug('resetAgg');
    aggQuery.value = undefined;
    aggSet.value = {};
    aggResult.value = undefined;
    aggAutoReload.value = false;
  }

  async function loadAggResult(flt: QueryFilter = {}) {
    if (!hasDir.value) {
      throw 'Agg:Parent DIR without defined!';
    }
    if (!aggQuery.value) {
      throw 'Agg:without aggName';
    }
    let agg = aggSet.value[aggQuery.value];
    if (!agg) {
      throw `Agg:[${aggQuery.value}] Not Exists`;
    }
    if (!agg.by) {
      throw `Agg:[${aggQuery.value}] Bad Setting: ${JSON5.stringify(
        agg,
        null,
        '   '
      )}`;
    }

    // Ignore the specil keys in filter to agg more data
    let ignore = Match.parse(agg.ignore);
    // Query
    let qmeta = _.omitBy(flt, (_v, k) => {
      return ignore.test(k);
    });
    _.assign(qmeta, agg.match);
    let input = JSON.stringify(qmeta);

    // Show Keys
    let cmdText = `o id:${dirId.value}/index @agg ${agg.by} -match -cqn`;
    let reo = await Walnut.exec(cmdText, { input, as: 'json' });

    // Update
    aggResult.value = reo;
  }

  //....................................................
  return {
    // State
    aggQuery,
    aggSet,
    aggAutoReload,
    aggResult,
    // Getter
    // Actions
    resetAgg,
    loadAggResult,
  } as DirAggFeature;
}
