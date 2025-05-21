<script lang="ts" setup>
  import { TiLayoutTabs, TiRoadblock } from "@site0/tijs";
  import { computed } from "vue";
  import { useObjViewerLayout } from "./use-obj-viewer-layout";
  import { useObjViewerSchema } from "./use-obj-viewer-schema";
  import { useWnObjViewer } from "./use-wn-obj-viewer";
  import { WnObjViewerEmitter, WnObjViewerProps } from "./wn-obj-viewer-types";
  //-----------------------------------------------------
  const emit = defineEmits<WnObjViewerEmitter>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjViewerProps>(), {
    tabsAlign: "left",
    tabsAt: "bottom",
    tabItemSpace: "m",
    tabs: () => ["meta", "preview", "content"],
    emptyRoadblock: () => ({
      icon: "fas-arrow-left",
      text: "i18n:nil-detail",
    }),
    contentTab: "content",
    formatJsonIndent: 2,
  });
  //-----------------------------------------------------
  //const _api = computed(() => useWnObjViewer(props, emit));
  const _api = useWnObjViewer(props, emit);
  //-----------------------------------------------------
  const EmptyRoadblock = computed(() => {
    return {
      icon: "fas-arrow-left",
      text: "i18n:nil-detail",
    };
  });
  //-----------------------------------------------------
  const GUILayout = computed(() => useObjViewerLayout(props, _api));
  const GUISchema = computed(() => useObjViewerSchema(props, _api));
  //-----------------------------------------------------
</script>
<template>
  <TiLayoutTabs
    v-if="props.meta"
    className="cover-parent"
    v-bind="GUILayout"
    :schema="GUISchema"
    @tab-change="_api.onTabChange"
    @block="_api.handleBlockEvent" />
  <TiRoadblock v-else v-bind="EmptyRoadblock" />
</template>
