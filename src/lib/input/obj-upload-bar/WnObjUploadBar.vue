<script lang="ts" setup>
  import { ImageProps, TiUploadBar, UploadBarProps } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, ref, watch } from 'vue';
  import { WnObj } from '../..';
  import { useWnObjUploader, WnObjUploaderEmitter } from '../../_features';
  import { WnObjUploadBarProps } from './wn-obj-upload-bar-types';
  //-----------------------------------------------------
  const emit = defineEmits<WnObjUploaderEmitter>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjUploadBarProps>(), {
    valueType: 'idPath',
    uploadButton: true,
    clearButton: false,
  });
  //-----------------------------------------------------
  const _obj = ref<WnObj>();
  const _base64_data = ref<string>();
  const Uploader = computed(() =>
    useWnObjUploader(props, emit, _obj, _base64_data)
  );
  //-----------------------------------------------------
  const BarConfig = computed(() => {
    let re: UploadBarProps = { ..._.omit(props, ['value', 'valueType']) };
    // 如果出错，显示一个错误类型
    if (Uploader.value.isInvalid.value) {
      re.type = 'danger';
      re.tip = Uploader.value.FailMessage.value;
    }
    // 这里拼装上对象显示
    re.preview = _.assign(
      {
        objectFit: 'cover',
      } as ImageProps,
      props.preview,
      Uploader.value.Preview.value
    );

    // 文字显示
    re.text = Uploader.value.Text.value;

    // 没有值就不显示删除按钮
    if (!Uploader.value.hasValue.value) {
      re.clearButton = false;
      re.prefixForClean = 'no';
      re.nilValue = true;
    }

    // 再拼装上上传进度
    if (Uploader.value.isUploading.value && Uploader.value.Progress.value > 0) {
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
  <TiUploadBar
    v-bind="BarConfig"
    @upload="onUploadFile"
    @clear="Uploader.doClear()" />
</template>
