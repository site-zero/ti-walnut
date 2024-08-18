import { ComputedRef } from 'vue';
import {
  DirEditingFeature,
  DirKeeplInfo,
  DirStoreOptions,
  WnObj,
} from '../../../..';
import {
  DirInnerContext2,
  DirKeepFeatures,
  DirReloadingFeature,
  DirSelectingFeature,
} from './dir.type';

export function userDirReloading(
  context: DirInnerContext2,
  _keep: ComputedRef<DirKeepFeatures>,
  _selecting: DirSelectingFeature,
  _editing: DirEditingFeature
): DirReloadingFeature {
  let { _dir, _query, _agg, _view, _meta, _selection } = context;

  function _get_current_keep_info(): DirKeeplInfo {
    return {
      ..._view,
      ..._query,
      ..._selection,
    };
  }

  function keepState() {
    let info = _get_current_keep_info();
    _keep.value.saveToLocal(info);
  }

  /**
   * Reload all : data & view setting
   * @param obj
   */
  async function reload(obj?: WnObj) {
    await _dir.initDirSettings(obj);

    _view.resetView();
    _query.resetQuery();
    _agg.resetAgg();

    await _view.loadView();
    _view.applyView(_dir.behaviors.value, {
      ..._query,
      ..._agg,
    });

    let info = _get_current_keep_info();
    _keep.value.restoreFromLocal(info, _selecting.updateSelection);

    await refresh();
  }

  /**
   * Reload all data
   */
  async function refresh() {
    await _query.queryList();
    if (_agg.aggAutoReload.value) {
      await _agg.loadAggResult();
    }
    await _selecting.syncMetaContentBySelection();
  }

  return {
    reload,
    refresh,
    keepState,
  };
}
