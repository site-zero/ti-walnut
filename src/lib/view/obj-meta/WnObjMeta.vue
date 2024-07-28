<script lang="ts" setup>
  import { TiForm, FormProps, Vars, FormField } from '@site0/tijs';
  import _ from 'lodash';
  import { computed } from 'vue';
  import { useObjFields } from '../..';
  import { WnObjMetaProps } from './wn-obj-meta-types';
  //-----------------------------------------------------
  const FIELDS = useObjFields();
  //-------------------------------------------------------
  let emit = defineEmits<{
    (eventName: 'change', payload: Vars): void;
  }>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjMetaProps>(), {
    emptyRoadblock: () => ({
      icon: 'fas-arrow-left',
      text: 'i18n:blank-to-edit',
    }),
  });
  //-----------------------------------------------------
  const FormConfig = computed(() => {
    return {
      layoutHint: 1,
      emptyRoadblock: props.emptyRoadblock,
    } as FormProps;
  });
  //-----------------------------------------------------
  const FormFields = computed(() => {
    return [
      FIELDS.getFieldGroup('General', 'id,race,nm,title'),
      FIELDS.getFieldGroup('File Content', 'tp,mime,len,sha1', {
        visible: { race: 'FILE' },
      }),
      FIELDS.getFieldGroup('Privilge & Time', 'd0,d1,c,m,g,ct,lm,expi'),
    ];
  });
  //-----------------------------------------------------
</script>
<template>
  <TiForm
    class="fit-parent"
    v-bind="FormConfig"
    :fields="FormFields"
    :data="props.value"
    @change="emit('change', $event)" />
</template>
