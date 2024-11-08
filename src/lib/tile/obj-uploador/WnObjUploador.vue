<script lang="ts" setup>
  import { TiUploadBar, UploadBarProps } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, ref, watch } from 'vue';
  import { WnObj } from '../..';
  import { useObjUploader } from '../../_features';
  import { WnObjUploadorProps } from './wn-obj-uploador-types';
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjUploadorProps>(), {
    valueType: 'auto',
  });
  //-----------------------------------------------------
  const _obj = ref<WnObj>();
  const Uploader = computed(() => useObjUploader(_obj, props));
  //-----------------------------------------------------
  const BarConfig = computed(() => {
    let re: UploadBarProps = { ..._.omit(props, ['value', 'valueType']) };
    // 这里拼装上对象显示
    re.preview = _.assign({}, props.preview, Uploader.value.BarPreview.value);
    // 再拼装上上传进度
    if (Uploader.value.isUploading.value) {
      re.progress = _.assign({}, props.progress);
      re.progress.value = Uploader.value.Progress.value;
    }
    return re;
  });
  //-----------------------------------------------------
  function onUploadFile(file: File) {
    Uploader.value.doUpload(file);
  }
  //-----------------------------------------------------
  watch(
    () => props.value,
    (val) => {
      Uploader.value.loadObj(val);
    },
    {
      immediate: true,
    }
  );
  //-----------------------------------------------------
</script>
<template>
  <TiUploadBar v-bind="BarConfig" @upload="onUploadFile" />
</template>
