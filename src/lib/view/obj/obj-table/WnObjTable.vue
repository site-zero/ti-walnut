<script lang="ts" setup>
  import { TiTable, TiThumb } from '@site0/tijs';
  import { computed, onMounted, ref, useTemplateRef } from 'vue';
  import { ObjUploadItem, useObjDropToUpload } from './use-obj-drop-to-upload';
  import { getObjTableColumns } from './use-obj-table-columns';
  import { WnObjTableEmitter, WnObjTableProps } from './wn-obj-table-types';
  //-------------------------------------------------------
  let emit = defineEmits<WnObjTableEmitter>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjTableProps>(), {
    columns: () => getObjTableColumns(),
  });
  //-----------------------------------------------------
  const $el = useTemplateRef('el');
  const _drag_enter = ref(false);
  const _upload_files = ref<ObjUploadItem[]>([]);
  //-----------------------------------------------------
  const TopClass = computed(() => {
    return {
      'drag-enter': _drag_enter.value || hasUploading.value,
    };
  });
  //-----------------------------------------------------
  const hasUploading = computed(() => _upload_files.value.length > 0);
  //-----------------------------------------------------
  onMounted(() => {
    if (props.upload) {
      useObjDropToUpload({
        _drag_enter,
        _upload_files,
        target: () => ($el.value ? ($el.value as HTMLElement) : null),
        uploadOptions: () => props.upload,
        emit,
      });
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
  @use './wn-obj-table.scss';
</style>
