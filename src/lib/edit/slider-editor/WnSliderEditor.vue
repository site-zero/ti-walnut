<script lang="ts" setup>
  import { TiLayoutGrid, TiThumb } from '@site0/tijs';
  import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
  import { ObjUploadItem } from '../../_types';
  import { useObjDropToUpload } from '../../view/obj/obj-table/use-obj-drop-to-upload';
  import { useWnSliderEditorApi } from './use-wn-slider-editor-api';
  import { useWnSliderEditorLayout } from './use-wn-slider-editor-layout';
  import { useWnSliderEditorScheme } from './use-wn-slider-editor-schema';
  import {
    WnSliderEditorProps,
    WnSliderEmitter,
  } from './wn-slider-editor-types';
  //-----------------------------------------------------
  const emit = defineEmits<WnSliderEmitter>();
  //-----------------------------------------------------
  const props = defineProps<WnSliderEditorProps>();
  //-----------------------------------------------------
  const api = useWnSliderEditorApi(props, emit);
  //-----------------------------------------------------
  const $el = useTemplateRef('el');
  const _drag_enter = ref(false);
  const _upload_files = ref<ObjUploadItem[]>([]);
  //-----------------------------------------------------
  const _upload_api = useObjDropToUpload({
    _drag_enter,
    _upload_files,
    target: () =>
      $el.value && props.upload ? ($el.value as HTMLElement) : null,
    uploadOptions: () => props.upload,
    callback: (objs) => {
      //console.log('upload done', objs);
      api.appendMedia(objs);
    },
  });
  //-----------------------------------------------------
  const hasUploading = computed(() => _upload_files.value.length > 0);
  //-----------------------------------------------------
  const TopClass = computed(() => {
    return {
      'drag-enter': _drag_enter.value || hasUploading.value,
    };
  });
  //-----------------------------------------------------
  const GUILayout = computed(() => useWnSliderEditorLayout(props, api));
  const GUISchema = computed(() =>
    useWnSliderEditorScheme(props, api, _upload_api)
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
</script>
<template>
  <div class="wn-slider-editor fit-parent" :class="TopClass" ref="el">
    <TiLayoutGrid
      className="cover-parent"
      v-bind="GUILayout"
      :schema="GUISchema" />
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
  @use './wn-slider-editor.scss';
</style>
