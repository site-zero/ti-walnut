<script lang="ts" setup>
  import {
    ObjUploadItem,
    useObjDropToUpload,
    WnObjWall,
  } from "@site0/ti-walnut";
  import { I18n, TiIcon, TiThumb } from "@site0/tijs";
  import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
  import { useWnObjMultiUploadTailApi } from "./use-wn-omup-api";
  import {
    WnObjMultiUploadTailEmitter,
    WnObjMultiUploadTailProps,
  } from "./wn-omup-types";
  //-----------------------------------------------------
  const emit = defineEmits<WnObjMultiUploadTailEmitter>();
  const props = withDefaults(defineProps<WnObjMultiUploadTailProps>(), {
    placeholder: "i18n:wn-obj-multi-upload-tiles-placeholder",
    uploadIcon: "fas-upload",
    valueType: "idPath",
  });
  //-----------------------------------------------------
  const api = useWnObjMultiUploadTailApi(props, emit);
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
    callback: (objs) => emit("change", objs),
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
  watch(
    () => props.upload,
    () => {
      _upload_api.reset();
    }
  );
  //-----------------------------------------------------
  watch(
    () => props.value,
    async () => {
      await api.reloadObjs();
    },
    { immediate: true }
  );
  //-----------------------------------------------------
  watch(
    () => props.mountHome,
    async () => {
      await api.reloadMountHome();
    },
    { immediate: true }
  );
  //-----------------------------------------------------
  onMounted(() => {
    if (props.upload) {
      _upload_api.reset();
    }
  });
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-obj-multi-upload-tail" :class="TopClass" ref="el">
    <!--| 占位 |-->
    <a class="placeholder" v-if="api.isEmpty.value">
      <TiIcon :value="props.uploadIcon" />
      <span>{{ I18n.text(props.placeholder) }}</span>
    </a>
    <!--| 展示控件 |-->
    <WnObjWall v-else :data="api.ObjList.value"
     />
    <!--| 上传 |-->
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
<style lang="scss">
  @use "./wn-omup.scss";
</style>
