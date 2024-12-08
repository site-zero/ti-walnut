import { computed, ref } from 'vue';
import { Walnut } from '../../core';
import { UserSidebar } from '../_types/wn-types';

const _sidebar = ref<UserSidebar>();

export function useSidebar() {
  async function reload() {
    _sidebar.value = await Walnut.fetchSidebar();
  }

  return {
    keepAt: computed(() => _sidebar.value?.statusStoreKey),
    sidebar: computed(() => _sidebar.value?.sidebar),
    reload,
  };
}
