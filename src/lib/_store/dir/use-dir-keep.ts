import { computed, ref } from 'vue';
import { DirKeepFeatures, DirKeepSetting, DirKeeplInfo } from './dir.type';
import { useKeep } from '@site0/tijs';

export function useDirKeep(): DirKeepFeatures {
  let K = {
    keepAt: ref(),
    keepMode: ref('local'),
    filterIgnore: ref(),
  } as DirKeepSetting;

  let Keep = computed(() => {
    if (K.keepAt.value) {
      return useKeep({
        keepAt: K.keepAt.value,
        keepMode: K.keepMode.value,
      });
    }
  });

  function saveToLocal(info: DirKeeplInfo) {
    if (Keep.value) {
      let data = {
        filter: info.filter.value,
        sorter: info.sorter.value,
        guiShown: info.guiShown.value,
      };
      Keep.value.save(data);
    }
  }

  function restoreFromLocal(info: DirKeeplInfo) {
    if (Keep.value) {
      let data = Keep.value.loadObj({});
      if (data) {
        if (data.filter) {
          info.filter.value = data.filter;
        }
        if (data.sorter) {
          info.sorter.value = data.sorter;
        }
        if (data.guiShown) {
          info.guiShown.value = data.guiShown;
        }
      }
    }
  }

  return {
    ...K,
    saveToLocal,
    restoreFromLocal,
  };
}
