import { Util } from '@site0/tijs';
import _ from 'lodash';
import { ComputedRef, ref } from 'vue';
import { DirEditingFeature, DirInnerContext2, WnObj } from '../../../..';
import { DirKeepFeatures, DirSelectingFeature } from './dir.type';

export function userDirSelecting(
  context: DirInnerContext2,
  _keep: ComputedRef<DirKeepFeatures>,
  _editing: DirEditingFeature
): DirSelectingFeature {
  let { _query, _meta, _content, _selection } = context;

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

    // 更新选区
    _selection.currentId.value = currentId;
    _selection.checkedIds.value = ckIds;
    console.log(`Keep.saveSelection(${currentId}, ${ckIds});`);
    _keep.value.saveSelection(currentId, ckIds);

    // 更新当前元数据和内容
    syncMetaContentBySelection();
  }

  async function syncMetaContentBySelection() {
    console.log('syncMetaContentBySelection');
    let currentId = _selection.currentId.value;
    // 更新当前元数据
    let meta: WnObj | undefined = undefined;
    if (currentId) {
      meta = _.find(_query.list.value, (li) => li.id == currentId);
    }
    _meta.value.initMeta(meta);

    // 尝试自动加载内容
    if (meta) {
      await _editing.autoLoadContent();
    }
    // 取消当前内容
    else {
      _content.value.reset();
    }
  }

  function clearSelection() {
    _selection.currentId.value = undefined;
    _selection.checkedIds.value = {};
    _meta.value.initMeta();
    _content.value.reset();
  }

  return {
    updateSelection,
    syncMetaContentBySelection,
    clearSelection,
  };
}
