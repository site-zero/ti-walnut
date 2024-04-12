<script lang="ts" setup>
  import JSON5 from 'json5';
  import _ from 'lodash';
  import { computed } from 'vue';
  import { WnObj } from '../../';

  const props = defineProps<{
    value: WnObj[];
  }>();

</script>
<template>
  <div class="wn-obj-list">
    对象列表
  </div>
</template>
<style lang="scss" scoped>
  @use '@site0/tijs/scss' as *;
</style>
