<script lang="ts" setup>
  import { ListEmitter, TiList } from '@site0/tijs';
  import { getWnObjIcon } from '../../../../core';
  import { WnObjListProps } from './wn-obj-list-types';
  //-------------------------------------------------------
  let emit = defineEmits<ListEmitter>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjListProps>(), {
    getIcon: () => (it: any) => {
      return getWnObjIcon(it);
    },
    getValue: 'id',
    getId: 'id',
    getText: () => (it: any) => it.title || it.nm || it.id,
    getTip: () => (it: any) => it.tip || it.brief,
    size: 'm',
    canSelect: undefined,
    canHover: undefined,
    allowUserSelect: undefined,
    autoI18n: undefined,
    textAsHtml: true,
    borderStyle: 'dotted'
  });
  //-----------------------------------------------------
</script>
<template>
  <TiList
    class="fit-parent"
    v-bind="props"
    @select="emit('select', $event)"
    @open="emit('open', $event)" />
</template>
