import { getLogger, Pager, WnObjStatus } from '@site0/tijs';
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

export function userDirQuery(options: DirInitGetters): DirQueryFeature {
  log.debug('userDirQuery');
  let { homeIndexId, isHomeExists } = options;
  // Prepare data
  let _fixed_match = ref<QueryFilter>({});
  let _filter = ref<QueryFilter>({});
  let _sorter = ref<QuerySorter>({});
  let _obj_keys = ref<string>('');
  let _join_one = ref<QueryJoinOne>();
  let _pager = ref<Pager>();

  let _current_id = ref<string>();
  let _checked_ids = ref<Record<string, boolean>>({});
  let _list = ref<WnObj[]>([]);
  let _item_status = ref<Record<string, WnObjStatus>>({});

  //-----------------------------------------------
  // Getters
  //-----------------------------------------------
  const queryPageNumber = computed(() => {
    let pg = _pager.value;
    if (!pg) {
      return 1;
    }
    return pg.pageNumber ?? pg.pn ?? 1;
  });
  //-----------------------------------------------
  const queryPageSize = computed(() => {
    let pg = _pager.value;
    if (!pg) {
      return 20;
    }
    return pg.pageSize ?? pg.pgsz ?? 20;
  });
  //-----------------------------------------------
  const isLongPager = computed(() => {
    let pg = _pager.value;
    if (!pg) {
      return false;
    }
    return (pg.pageSize ?? 0) > 0 && (pg.pageNumber ?? 0) > 0;
  });
  //-----------------------------------------------
  const isShortPager = computed(() => {
    let pg = _pager.value;
    if (!pg) {
      return false;
    }
    return (pg.pgsz ?? 0) > 0 && (pg.pn ?? 0) > 0;
  });
  //-----------------------------------------------
  const isPagerEnabled = computed(
    () => _pager.value && (isLongPager.value || isShortPager.value)
  );
  //-----------------------------------------------
  // Methods
  //-----------------------------------------------
  function resetQuery() {
    log.debug('resetQuery');
    _fixed_match.value = {};
    _filter.value = {};
    _sorter.value = {};
    _obj_keys.value = '';
    _list.value = [];
    _pager.value = undefined;
  }

  function updateListItem(meta: WnObj) {
    let metaId = meta?.id;
    if (!metaId) {
      return false;
    }
    let re = false;
    let list = [];
    if (_list.value) {
      for (let it of _list.value) {
        if (it.id == metaId) {
          re = true;
          list.push(_.cloneDeep(meta));
        } else {
          list.push(it);
        }
      }
    }
    _list.value = list;
    return re;
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
    if (!_.isEmpty(_sorter.value)) {
      cmds.push(`-sort '${JSON.stringify(_sorter.value)}'`);
    }

    // Join One
    let jo = _join_one.value;
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
    if (_obj_keys.value) {
      cmds.push(`'${_obj_keys.value}'`);
    }

    cmds.push('-cqnl');

    return cmds.join(' ');
  }

  async function queryList(flt?: QueryFilter) {
    if (log.isDebugEnabled()) {
      log.debug('queryList', {
        fixedMatch: _fixed_match.value,
        filter: _filter.value,
        sorter: _sorter.value,
        objKeys: _obj_keys.value,
        joinOne: _join_one.value,
        pager: _pager.value,
        currentId: _current_id.value,
        checkedIds: _checked_ids.value,
        queryPageNumber: queryPageNumber.value,
        queryPageSize: queryPageSize.value,
        isLongPager: isLongPager.value,
        isShortPager: isShortPager.value,
        isPagerEnabled: isPagerEnabled.value,
      });
    }
    let cmdText = makeQueryCommand();
    let q = _.assign({}, _filter.value, _fixed_match.value, flt);
    let input = JSON.stringify(q);
    log.info('queryList=>', cmdText, ' << ', q);

    let reo = await Walnut.exec(cmdText, { input, as: 'json' });

    if (_.isArray(reo)) {
      _list.value = reo as unknown as WnObj[];
      log.info('>> list:', _list.value);
    } else if (reo.list && reo.pager) {
      _list.value = reo.list;
      _pager.value = reo.pager;
      log.info('>> list:', _list.value);
      log.info('>> page:', _pager.value);
    }
  }

  //....................................................
  return {
    // State
    pager: _pager,
    fixedMatch: _fixed_match,
    filter: _filter,
    sorter: _sorter,
    joinOne: _join_one,
    objKeys: _obj_keys,
    // Selections
    currentId: _current_id,
    checkedIds: _checked_ids,
    list: _list,
    itemStatus: _item_status,
    // Computed
    queryPageNumber,
    queryPageSize,
    isLongPager,
    isShortPager,
    isPagerEnabled,
    // Methods
    updateListItem,
    resetQuery,
    queryList,
  } as DirQueryFeature;
}
