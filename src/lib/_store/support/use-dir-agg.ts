import { Pager, ShortNamePager, Vars } from '@site0/tijs';
import { Ref, computed, reactive, ref } from 'vue';
import { userGlobalSettingsStore, userGlobalStatusStore } from '..';
import { WnObj } from '../../';
import _ from 'lodash';
import { QueryAgg, QueryFilter, QueryJoinOne, QuerySorter } from './dir.type';
import { Walnut } from '../../../core';

export function userDirAgg(oDir: Ref<WnObj>) {
  // Prepare settings
  let settings = userGlobalSettingsStore();
  let status = userGlobalStatusStore();

  // Prepare data
  let fixedMatch = ref<QueryFilter>({});
  let aggQuery = ref<QueryFilter>({});
  let aggName = ref<string>();
  let aggSet = ref<Record<string, QueryAgg>>({});

  let sorter = ref<QuerySorter>({});
  let objKeys = ref<string>('');
  let joinOne = ref<QueryJoinOne | null>(null);
  let list = ref<WnObj[]>([]);
  let pager = ref<Pager | null>(null);

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
    return pg.pageSize > 0 && pg.pageNumber > 0;
  });
  let isShortPager = computed(() => {
    let pg = pager.value;
    if (!pg) {
      return false;
    }
    return pg.pgsz > 0 && pg.pn > 0;
  });
  let isPagerEnabled = computed(
    () => pager.value && (isLongPager.value || isShortPager.value)
  );
  let dirId = computed(() => _.get(oDir.value, 'id'));
  let hasDir = computed(() => (dirId.value ? true : false));

  // -----------------------------------------------
  // Actions
  // -----------------------------------------------

  function makeQueryCommand() {
    if (!hasDir.value) {
      throw 'Parent DIR without defined!';
    }
    let cmds = [`o 'id:${dirId.value}' @query`];

    // Eval Pager
    if (isPagerEnabled.value) {
      let limit = queryPageNumber.value;
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

  async function queryList(flt?: QueryFilter): Promise<WnObj[]> {
    let cmdText = makeQueryCommand();
    let q = _.assign({}, filter.value, fixedMatch.value, flt);
    let input = JSON.stringify(q);

    status.loading = true;
    let reo = await Walnut.exec(cmdText, { input, as: 'json' });
    status.loading = false;

    if (_.isArray(reo)) {
      list.value = reo as unknown as WnObj[];
    } else if (reo.list && reo.pager) {
      pager.value = reo.pager;
    }

    return list.value;
  }

  //....................................................
  return {
    // State
    list,
    pager,
    fixedMatch,
    filter,
    sorter,
    objKeys,
    // Getter
    isPagerEnabled,
    // Actions
    queryList,
  };
}
