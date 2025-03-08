<script lang="ts" setup>
  import { SideBarItem, TiSidebar } from '@site0/tijs';
  import {
    useGlobalStatus,
    useSidebar,
    WnHubSideNavProps,
  } from '../../../../lib';
  //--------------------------------------------------
  const emit = defineEmits<{
    (eventName: 'fire', item: SideBarItem): void;
  }>();
  //--------------------------------------------------
  const props = defineProps<WnHubSideNavProps>();
  //--------------------------------------------------
  const _gl_sta = useGlobalStatus();
  const _sidebar = useSidebar();
  //--------------------------------------------------
  function OnFireItem(it: SideBarItem) {
    emit('fire', it);
  }
  //--------------------------------------------------
  function isCurrentItem(it: SideBarItem): boolean {
    if (it.href) {
      let path = _gl_sta.data.appPath || '';
      if (!/^\//.test(path)) {
        path = '/' + path;
      }
      return path.startsWith(it.href || '');
    }
    return false;
  }
  //--------------------------------------------------
</script>
<template>
  <TiSidebar
    class="cover-parent"
    :class="props.className"
    :style="props.style"
    :items="_sidebar.sidebar.value ?? []"
    :is-current="isCurrentItem"
    @fire="OnFireItem" />
</template>
