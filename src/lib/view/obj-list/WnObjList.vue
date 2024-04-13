<script lang="ts" setup>
  import { TableProps, TiTable } from '@site0/tijs';
  import _ from 'lodash';
  import { computed } from 'vue';
  import { useObjColumns } from '../../../lib';

  const COL = useObjColumns();

  type ObjListPros = Omit<TableProps, 'columns'> & {
    columns?: string[];
  };

  const props = withDefaults(defineProps<ObjListPros>(), {
    showRowIndex: true,
    showHeader: true,
  });

  const TableConfig = computed(() => {
    return _.omit(props, 'columns');
  });

  const TableColumns = computed(() => {
    let colNames = props.columns || ['nm-icon', 'tp', 'ct'];
    return COL.getColumns(colNames);
  });
</script>
<template>
  <TiTable class="fit-parent" v-bind="TableConfig" :columns="TableColumns" />
</template>
<style lang="scss" scoped>
  @use '@site0/tijs/scss' as *;
</style>
