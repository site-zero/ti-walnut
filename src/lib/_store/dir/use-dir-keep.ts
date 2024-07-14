import { useKeep } from '@site0/tijs';
import { computed, Ref } from 'vue';
import { DirGUIViewBehaviors, DirKeepFeatures, DirKeeplInfo, DirUpdateSelection } from './dir.type';

export function useDirKeep(options: DirGUIViewBehaviors): DirKeepFeatures {
  console.log('useDirKeep', options.keepSelection);
  const KeepSelection = computed(() => useKeep(options.keepSelection));
  const KeepFilter = computed(() => useKeep(options.keepFilter));
  const KeepSorter = computed(() => useKeep(options.keepSorter));
  const KeepShown = computed(() => useKeep(options.keepShown));

  function saveSelection(
    currentId?: string,
    checkedIds?: Record<string, boolean>
  ) {
    KeepSelection.value.save({
      currentId: currentId,
      checkedIds: checkedIds,
    });
  }

  function saveToLocal(info: DirKeeplInfo) {
    saveSelection(info.currentId.value, info.checkedIds.value);
    KeepFilter.value.save(info.filter.value);
    KeepSorter.value.save(info.sorter.value);
    KeepShown.value.save(info.guiShown.value);
  }

  function restoreSelection(
    currentId: Ref<string | undefined>,
    checkedIds: Ref<Record<string, boolean>>,
    updateSelection: DirUpdateSelection
  ) {
    let re =
      KeepSelection.value.loadObj({
        currentId: currentId.value,
        checkedIds: checkedIds.value,
      }) ?? {};

    updateSelection(re.currentId, re.checkedIds);
  }

  function restoreFromLocal(
    info: DirKeeplInfo,
    updateSelection: DirUpdateSelection
  ) {
    // Selection
    restoreSelection(info.currentId, info.checkedIds, updateSelection);

    // Filter
    info.filter.value = KeepFilter.value.loadObj() ?? info.filter.value ?? {};
    info.sorter.value = KeepSorter.value.loadObj() ?? info.sorter.value ?? {};
    info.guiShown.value =
      KeepShown.value.loadObj() ?? info.guiShown.value ?? {};
  }

  return {
    KeepSelection,
    KeepFilter,
    KeepSorter,
    KeepShown,
    saveSelection,
    saveToLocal,

    restoreSelection,
    restoreFromLocal,
  };
}
