<script lang="ts" setup>
  import { TableEmitter, TiTable } from '@site0/tijs';
  import _ from 'lodash';
  import { computed } from 'vue';
  import { useObjColumns } from '../../../lib';
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
  });
  //-----------------------------------------------------
  const TableConfig = computed(() => {
    return _.omit(props, 'columns');
  });
  //-----------------------------------------------------
  const TableColumns = computed(() => {
    let colNames = props.columns || ['obj-nm-title-icon', 'tp', 'lm'];
    return COL.getColumns(colNames);
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
