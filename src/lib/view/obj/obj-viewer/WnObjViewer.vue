<script lang="ts" setup>
  import { TabChangeEvent, TiLayoutTabs } from '@site0/tijs';
  import { computed } from 'vue';
  import { useObjViewerLayout } from './use-obj-viewer-layout';
  import { useObjViewerSchema } from './use-obj-viewer-schema';
  import { useWnObjViewer } from './use-wn-obj-viewer';
  import { WnObjViewerEmitter, WnObjViewerProps } from './wn-obj-viewer-types';
  //-----------------------------------------------------
  const emit = defineEmits<WnObjViewerEmitter>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjViewerProps>(), {
    tabsAlign: 'left',
    tabsAt: 'bottom',
    tabItemSpace: 'm',
    tabs: () => ['meta', 'content', 'preview', 'edit'],
  });
  //-----------------------------------------------------
  const api = useWnObjViewer(props, emit);
  //-----------------------------------------------------
  const GUILayout = computed(() => useObjViewerLayout(props, api));
  const GUISchema = computed(() => useObjViewerSchema(props, api));
  //-----------------------------------------------------
  function onTabChange(event: TabChangeEvent) {
    emit('show-content', 'content' == event.to.value);
  }
  //-----------------------------------------------------
</script>
<template>
  <TiLayoutTabs
    className="cover-parent"
    v-bind="GUILayout"
    :schema="GUISchema"
    @tab-change="onTabChange" />
</template>
