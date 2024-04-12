import { Pager, WnObjStatus, getLogger } from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import { WnObj } from '../../';
import { Walnut } from '../../../core';
import {
  DirInitGetters,
  DirQueryFeature,
  QueryFilter,
  QueryJoinOne,
  QuerySorter,
} from './dir.type';

const log = getLogger('wn.store.dir.query');

export function userDirQuery(options: DirInitGetters) {
  log.debug('userDirQuery');
  let { homeIndexId, isHomeExists } = options;
  // Prepare data
  let fixedMatch = ref<QueryFilter>({});
  let filter = ref<QueryFilter>({});
  let sorter = ref<QuerySorter>({});
  let objKeys = ref<string>('');
  let joinOne = ref<QueryJoinOne>();
  let pager = ref<Pager>();

  let currentId = ref<string>();
  let checkedIds = ref<Record<string, boolean>>({});
  let list = ref<WnObj[]>([]);
  let itemStatus = ref<Record<string, WnObjStatus>>({});

  // Getters
  let queryPageNumber = computed(() => {
    let pg = pager.value;
    if (!pg) {
      return 1;
    }
    return pg.pageNumber ?? pg.pn ?? 1;
  });
  let queryPageSize = computed(() => {
    let pg = pager.value;
    if (!pg) {
      return 20;
    }
    return pg.pageSize ?? pg.pgsz ?? 20;
  });
  let isLongPager = computed(() => {
    let pg = pager.value;
    if (!pg) {
      return false;
    }
    return (pg.pageSize ?? 0) > 0 && (pg.pageNumber ?? 0) > 0;
  });
  let isShortPager = computed(() => {
    let pg = pager.value;
    if (!pg) {
      return false;
    }
    return (pg.pgsz ?? 0) > 0 && (pg.pn ?? 0) > 0;
  });
  let isPagerEnabled = computed(
    () => pager.value && (isLongPager.value || isShortPager.value)
  );

  // -----------------------------------------------
  // Actions
  // -----------------------------------------------
  function resetQuery() {
    log.debug('resetQuery');
    fixedMatch.value = {};
    filter.value = {};
    sorter.value = {};
    objKeys.value = '';
    list.value = [];
    pager.value = undefined;
  }

  function makeQueryCommand() {
    if (!isHomeExists.value) {
      throw 'Query:Parent DIR without defined!';
    }
    let cmds = [`o 'id:${homeIndexId.value}' @query`];

    // Eval Pager
    if (isPagerEnabled.value) {
      let limit = queryPageSize.value;
      let skip = Math.max(0, queryPageSize.value * (queryPageNumber.value - 1));
      cmds.push(`-pager -limit ${limit} -skip ${skip}`);
    }

    // Sorter
    if (!_.isEmpty(sorter.value)) {
      cmds.push(`-sort '${JSON.stringify(sorter.value)}'`);
    }

    // Join One
    let jo = joinOne.value;
    if (jo && !_.isEmpty(jo.query)) {
      cmds.push('@join_one');
      if (jo.path) {
        cmds.push(`'${jo.path}'`);
      }
      cmds.push(`-query '${JSON.stringify(jo.query)}'`);
      if (jo.sort) {
        cmds.push(`-sort '${JSON.stringify(jo.sort)}'`);
      }
      if (jo.explain) {
        cmds.push(`-explain '${JSON.stringify(jo.explain)}'`);
      }
      if (jo.toKey) {
        cmds.push(`-to '${jo.toKey}'`);
      }
    }

    // Output
    cmds.push(`@json`);

    // Show Keys
    if (objKeys.value) {
      cmds.push(`'${objKeys.value}'`);
    }

    cmds.push('-cqnl');

    return cmds.join(' ');
  }

  async function queryList(flt?: QueryFilter) {
    console.log('--------------queryList');
    if (log.isDebugEnabled()) {
      log.debug('queryList', {
        fixedMatch: fixedMatch.value,
        filter: filter.value,
        sorter: sorter.value,
        objKeys: objKeys.value,
        joinOne: joinOne.value,
        pager: pager.value,
        currentId: currentId.value,
        checkedIds: checkedIds.value,
        queryPageNumber: queryPageNumber.value,
        queryPageSize: queryPageSize.value,
        isLongPager: isLongPager.value,
        isShortPager: isShortPager.value,
        isPagerEnabled: isPagerEnabled.value,
      });
    }
    let cmdText = makeQueryCommand();
    let q = _.assign({}, filter.value, fixedMatch.value, flt);
    let input = JSON.stringify(q);
    log.info('queryList=>', cmdText, ' << ', q);

    let reo = await Walnut.exec(cmdText, { input, as: 'json' });

    if (_.isArray(reo)) {
      list.value = reo as unknown as WnObj[];
      log.info('>> list:', list.value);
    } else if (reo.list && reo.pager) {
      list.value = reo.list;
      pager.value = reo.pager;
      log.info('>> list:', list.value);
      log.info('>> page:', pager.value);
    }
  }

  //....................................................
  return {
    // State
    pager,
    fixedMatch,
    filter,
    sorter,
    joinOne,
    objKeys,
    // Selections
    currentId,
    checkedIds,
    list,
    itemStatus,
    // Getter
    queryPageNumber,
    queryPageSize,
    isLongPager,
    isShortPager,
    isPagerEnabled,
    // Actions
    resetQuery,
    queryList,
  } as DirQueryFeature;
}
