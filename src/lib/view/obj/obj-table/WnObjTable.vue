<script lang="ts" setup>
  import { BUS_KEY, TiTable, TiThumb } from "@site0/tijs";
  import {
    computed,
    inject,
    onMounted,
    onUnmounted,
    ref,
    useTemplateRef,
    watch,
  } from "vue";
  import { ObjUploadItem } from "../../../_types";
  import { useObjDropToUpload } from "./use-obj-drop-to-upload";
  import { getObjTableColumns } from "./use-obj-table-columns";
  import { WnObjTableEmitter, WnObjTableProps } from "./wn-obj-table-types";
  //-------------------------------------------------------
  const bus = inject(BUS_KEY);
  //-------------------------------------------------------
  const emit = defineEmits<WnObjTableEmitter>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjTableProps>(), {
    columns: () => getObjTableColumns(),
  });
  //-----------------------------------------------------
  const $el = useTemplateRef("el");
  const _drag_enter = ref(false);
  const _upload_files = ref<ObjUploadItem[]>([]);
  //-----------------------------------------------------
  const _upload_api = useObjDropToUpload({
    _drag_enter,
    _upload_files,
    target: () =>
      $el.value && props.upload ? ($el.value as HTMLElement) : null,
    uploadOptions: () => props.upload,
    callback: (objs) => emit("upload:done", objs),
  });
  //-----------------------------------------------------
  const TopClass = computed(() => {
    return {
      "drag-enter": _drag_enter.value || hasUploading.value,
    };
  });
  //-----------------------------------------------------
  const hasUploading = computed(() => _upload_files.value.length > 0);
  //-----------------------------------------------------
  function doUpload() {
    console.log("doUpload");
    _upload_api.doUploadFiles();
  }
  //-----------------------------------------------------
  let _watched_bus: string | undefined = undefined;
  watch(
    () => props.busUploadKey,
    () => {
      if (_watched_bus) {
        bus?.off(doUpload, _watched_bus);
      }
      if (bus && props.busUploadKey) {
        bus.on(props.busUploadKey, doUpload);
        _watched_bus = props.busUploadKey;
      }
    },
    { immediate: true }
  );
  //-----------------------------------------------------
  watch(
    () => props.upload,
    () => {
      _upload_api.reset();
    }
  );
  //-----------------------------------------------------
  onMounted(() => {
    if (props.upload) {
      _upload_api.reset();
    }
  });
  //-----------------------------------------------------
  onUnmounted(() => {
    if (_watched_bus) {
      bus?.off(doUpload, _watched_bus);
    }
  });
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-obj-table fit-parent" ref="el" :class="TopClass">
    <div class="table-con fit-parent">
      <TiTable
        class="fit-parent"
        :keep-columns="props.keepColumns"
        :columns="props.columns"
        :data="props.data ?? []"
        :current-id="props.currentId"
        :checked-ids="props.checkedIds"
        :empty-roadblock="props.emptyRoadblock"
        @select="emit('select', $event)"
        @open="emit('open', $event)"
        @cell-change="emit('cell-change', $event)"
        @cell-open="emit('cell-open', $event)" />
    </div>
    <div class="uploading-box">
      <main v-if="hasUploading">
        <TiThumb
          v-for="item in _upload_files"
          :preview="item.preview"
          :progress="{ value: item.progress }"
          :text="item.text"
          :width="item.width"
          :height="item.height"
          :text-size="item.textSize"
          :text-align="item.textAlign"
          :text-padding="item.textPadding" />
      </main>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  @use "./wn-obj-table.scss";
</style>
