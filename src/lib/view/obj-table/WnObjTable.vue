<script lang="ts" setup>
  import { TableEmitter, TiTable, useObjColumns } from '@site0/tijs';
  import _ from 'lodash';
  import { computed } from 'vue';
  import { WnObjTableProps } from './wn-obj-table-types';
  //-----------------------------------------------------
  const COL = useObjColumns();
  //-------------------------------------------------------
  let emit = defineEmits<TableEmitter>();
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjTableProps>(), {
    showRowIndex: true,
    showHeader: true,
    columnResizable: true,
    multi: true,
    showCheckbox: true,
    canHover: true,
    canSelect: true,
    canCheck: true,
  });
  //-----------------------------------------------------
  const TableConfig = computed(() => {
    return _.omit(props, 'columns');
  });
  //-----------------------------------------------------
  const TableColumns = computed(() => {
    let colNames = props.columns || ['obj-nm-title-icon', 'tp', 'lm'];
    return COL.getColumnList(colNames);
  });
  //-----------------------------------------------------
</script>
<template>
  <TiTable
    class="fit-parent"
    v-bind="TableConfig"
    :columns="TableColumns"
    @select="emit('select', $event)"
    @open="emit('open', $event)"
    @cell-change="emit('cell-change', $event)"
    @cell-open="emit('cell-open', $event)" />
</template>
