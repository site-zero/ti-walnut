import { ComputedRef } from 'vue';
import { DirEditingFeature, WnObj } from '../../../..';
import {
  DirInnerContext2,
  DirKeepFeatures,
  DirReloadingFeature,
  DirSelectionFeature,
} from './dir.type';

export function userDirReloading(
  context: DirInnerContext2,
  _keep: ComputedRef<DirKeepFeatures>,
  _selection: DirSelectionFeature,
  _editing: DirEditingFeature
): DirReloadingFeature {
  let { _dir, _query, _agg, _view, _meta,_content } = context;

  function keepState() {
    _keep.value.saveToLocal({
      ..._view,
      ..._query,
    });
  }

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

    await _query.queryList();

    _keep.value.restoreFromLocal(
      {
        ..._view,
        ..._query,
      },
      _selection.updateSelection
    );
    if (_agg.aggAutoReload.value) {
      await _agg.loadAggResult();
    }
    console.log('NEED CONTNET', _editing.guiNeedContent.value);
    console.log('isNoEmptyFile', _meta.value.isNoEmptyFile.value);
    console.log('isFILE', _meta.value.isFILE.value);
    console.log('isDIR', _meta.value.isDIR.value);
    await _editing.autoLoadContent()
    console.log('done for reloading');
  }
  return {
    reload,
    keepState,
  };
}
