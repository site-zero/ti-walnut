<script lang="ts" setup>
  import { FieldRefer, FormProps, TiForm, Vars } from '@site0/tijs';
  import _ from 'lodash';
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
        '###=/#wn-obj-meta-fgt-general',
        'obj.nm',
        'obj.title',
        //'obj.pid',
        'obj.race',
        ['###=/#wn-obj-meta-fgt-file', { visible: { race: 'FILE' } }],
        'obj.tp',
        'obj.mime',
        'obj.len',
        'obj.sha1',
        '###=/#wn-obj-meta-fgt-timestamp',
        'obj.ct',
        'obj.lm',
        'obj.expi',
        '###=/#wn-obj-meta-fgt-permission',
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
    return _.assign(
      {
        className: 'cover-parent',
        emptyRoadblock: props.emptyRoadblock,
        maxFieldNameWidth: 80,
        layoutHint: '<300>',
        bodyPartGap: 'm',
      } as FormProps,
      props.formConf
    );
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
