import { Util } from '@site0/tijs';
import _ from 'lodash';
import { ComputedRef } from 'vue';
import { DirInnerContext2, WnObj } from '../../../..';
import { DirKeepFeatures, DirSelectionFeature } from './dir.type';

export function userDirSelecting(
  context: DirInnerContext2,
  _keep: ComputedRef<DirKeepFeatures>
): DirSelectionFeature {
  let { _query, _meta } = context;

  function updateSelection(
    currentId?: string,
    checkedIds?: string[] | Map<string, boolean> | Record<string, boolean>
  ) {
    if (_.isEmpty(checkedIds) && !_.isNil(currentId)) {
      checkedIds = [currentId];
    }
    let ckIds: Record<string, boolean>;
    if (_.isArray(checkedIds)) {
      ckIds = Util.arrayToRecord(checkedIds);
    } else if (_.isMap(checkedIds)) {
      ckIds = Util.mapToObj(checkedIds);
    } else {
      ckIds = _.cloneDeep(checkedIds) ?? {};
    }
    _query.currentId.value = currentId;
    _query.checkedIds.value = ckIds;
    console.log(`Keep.saveSelection(${currentId}, ${ckIds});`);
    _keep.value.saveSelection(currentId, ckIds);

    let meta: WnObj | undefined = undefined;
    if (currentId) {
      meta = _.find(_query.list.value, (li) => li.id == currentId);
    }
    _meta.value.initMeta(meta);
  }
  function clearSelection() {
    _query.currentId.value = undefined;
    _query.checkedIds.value = {};
  }

  return {
    updateSelection,
    clearSelection,
  };
}
