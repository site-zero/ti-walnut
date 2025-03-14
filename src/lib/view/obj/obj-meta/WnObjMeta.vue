<script lang="ts" setup>
  import { FieldRefer, FormProps, TiForm, Vars } from '@site0/tijs';
  import { computed } from 'vue';
  import { WnObjMetaProps } from './wn-obj-meta-types';
  //-------------------------------------------------------
  let emit = defineEmits<{
    (eventName: 'change', payload: Vars): void;
  }>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjMetaProps>(), {
    emptyRoadblock: () => ({
      icon: 'fas-arrow-left',
      text: 'i18n:nil-detail',
    }),
    fields: () =>
      [
        '###=/基本信息',
        'obj.nm',
        'obj.title',
        //'obj.pid',
        'obj.race',
        ['###=/文件信息', { visible: { race: 'FILE' } }],
        'obj.tp',
        'obj.mime',
        'obj.len',
        'obj.sha1',
        '###=/时间戳',
        'obj.ct',
        'obj.lm',
        'obj.expi',
        '###=/权限信息',
        'obj.id',
        'obj.d0',
        'obj.d1',
        'obj.c',
        'obj.m',
        'obj.g',
        'obj.md',
      ] as FieldRefer[],
  });
  //-----------------------------------------------------
  const FormConfig = computed(() => {
    return {
      className: 'cover-parent',
      emptyRoadblock: props.emptyRoadblock,
      maxFieldNameWidth: 80,
      layoutHint: '<300>',
      bodyPartGap: 'm',
    } as FormProps;
  });
  //-----------------------------------------------------
</script>
<template>
  <TiForm
    class="fit-parent"
    v-bind="FormConfig"
    :fields="props.fields"
    :data="props.value"
    @change="emit('change', $event)" />
</template>
