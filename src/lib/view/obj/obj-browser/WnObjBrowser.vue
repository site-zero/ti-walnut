<script lang="ts" setup>
  import { TiLayoutGrid, useKeep } from "@site0/tijs";
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
  const _keep = computed(() => useKeep(props.keepAt));
  const _api = useWnObjBrowserApi(props, emit, _keep);
  _api.restoreLocalSetting();
  //---------------------------------------------
  const GUILayout = computed(() => useWnObjBrowserLayout(props, _api));
  const GUISchema = computed(() => useWnObjBrowserSchema(props, _api));
  //-----------------------------------------------------
  const GUIShown = computed(() => ({
    detail: _api.ShowDetail.value,
  }));
  //-----------------------------------------------------
  watch(
    () => [props.loadMode, props.homePath, props.objList, props.objPath],
    async () => {
      console.log("WnObjBrowser watch => reload");
      _api.restoreLocalSetting();
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
    :shown="GUIShown"
    class="wn-obj-browser fit-parent" />
</template>
