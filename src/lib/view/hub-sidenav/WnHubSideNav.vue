<script lang="ts" setup>
  import {
    useGlobalStatus,
    useSidebar,
    WnHubSideNavProps,
  } from '@site0/ti-walnut';
  import { SideBarItem, TiSidebar } from '@site0/tijs';
  //--------------------------------------------------
  const emit = defineEmits<{
    (eventName: 'fire', item: SideBarItem): void;
  }>();
  //--------------------------------------------------
  const props = defineProps<WnHubSideNavProps>();
  //--------------------------------------------------
  const _global = useGlobalStatus();
  const _sidebar = useSidebar();
  //--------------------------------------------------
  function OnFireItem(it: SideBarItem) {
    emit('fire', it);
  }
  //--------------------------------------------------
  function isCurrentItem(it: SideBarItem): boolean {
    if (it.href) {
      return (_global.appPath || '').startsWith(it.href || '');
    }
    return false;
  }
  //--------------------------------------------------
</script>
<template>
  <TiSidebar
    :class="props.className"
    :style="props.style"
    :items="_sidebar.sidebar.value ?? []"
    :is-current="isCurrentItem"
    @fire="OnFireItem" />
</template>
