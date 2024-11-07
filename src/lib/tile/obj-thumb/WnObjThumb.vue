<script lang="ts" setup>
  import { LabelProps, TiLabel } from '@site0/tijs';
  import { computed } from 'vue';
  import { getWnObjIcon } from '../../../core';
  import { WnObjThumbProps } from './wn-obj-thumb-types';
  //-----------------------------------------------------
  const props = defineProps<WnObjThumbProps>();
  //-----------------------------------------------------
  const ObjIcon = computed(() => {
    return getWnObjIcon(props.value);
  });
  //-----------------------------------------------------
  const ObjLabel = computed(() => {
    let value = props.value ?? {};
    let re: LabelProps = { autoI18n: true };
    if (value) {
      let { title, nm } = value;
      if (title && nm) {
        if (title != nm) {
          re.value = title;
          //re.suffixText = nm;
        } else {
          re.value = nm;
          re.autoI18n = false;
        }
      }
      // 只有名称
      else {
        re.value = nm;
        re.autoI18n = false;
      }
    }
    // 空名称
    else {
      re.value = 'i18n:nil';
    }
    return re;
  });
  //-----------------------------------------------------
</script>
<template>
  <TiLabel v-bind="ObjLabel" :prefix-icon="ObjIcon" />
</template>
