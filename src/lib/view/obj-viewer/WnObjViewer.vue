<script lang="ts" setup>
  import { BlockEvent, TiLayoutTabs } from '@site0/tijs';
  import { computed } from 'vue';
  import { useObjViewerLayout } from './use-obj-viewer-layout';
  import { useObjViewerSchema } from './use-obj-viewer-schema';
  import { useWnObjViewer } from './use-wn-obj-viewer';
  import { WnObjViewerProps } from './wn-obj-viewer-types';
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjViewerProps>(), {
    tabsAlign: 'left',
    tabsAt: 'bottom',
    tabItemSpace: 's',
  });
  //-----------------------------------------------------
  const api = useWnObjViewer(props);
  //-----------------------------------------------------
  const GUILayout = computed(() => useObjViewerLayout(props, api));
  const GUISchema = computed(() => useObjViewerSchema(props, api));
  //-----------------------------------------------------
  function onBlock(event: BlockEvent) {
    console.log('onBlock', event);
  }
  //-----------------------------------------------------
</script>
<template>
  <TiLayoutTabs
    className="cover-parent"
    v-bind="GUILayout"
    :schema="GUISchema"
    @block="onBlock" />
</template>
