<script lang="ts" setup>
  import { TiLayoutGrid } from "@site0/tijs";
  import { computed, watch } from "vue";
  import { useWnObjBrowserLayout } from "./gui-wn-obj-browser-layout";
  import { useWnObjBrowserSchema } from "./gui-wn-obj-browser-schema";
  import { useWnObjBrowserApi } from "./use-wn-obj-browser-api";
  import {
    WnObjBrowserEmitter,
    WnObjBrowserProps,
  } from "./wn-obj-browser-types";
  //-----------------------------------------------------
  const emit = defineEmits<WnObjBrowserEmitter>();
  const props = withDefaults(defineProps<WnObjBrowserProps>(), {});
  const _api = useWnObjBrowserApi(props, emit);
  //---------------------------------------------
  const GUILayout = computed(() => useWnObjBrowserLayout(props, _api));
  const GUISchema = computed(() => useWnObjBrowserSchema(props, _api));
  //-----------------------------------------------------
  watch(
    () => [props.loadMode, props.homePath, props.objList, props.objPath],
    async () => {
      console.log("WnObjBrowser watch => reload");
      await _api.reload();
    },
    { immediate: true }
  );
  //-----------------------------------------------------
</script>
<template>
  <TiLayoutGrid
    v-bind="GUILayout"
    :schema="GUISchema"
    class="wn-obj-browser fit-parent" />
</template>
