import { ShortNamePager } from '@site0/tijs';
import { computed, reactive } from 'vue';
import { userGlobalSettingsStore } from '..';

export function userDirReload() {
  let settings = userGlobalSettingsStore();
  let pager = reactive({
    pn: 1,
    pgsz: 50,
    pgc: 0,
    sum: 0,
    skip: 0,
    count: 0,
  } as ShortNamePager);
  let isPagerEnabled = computed(() => pager.pn > 0);

  return { pager };
}
