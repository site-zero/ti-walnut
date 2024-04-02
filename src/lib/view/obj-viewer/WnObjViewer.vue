<script lang="ts" setup>
  import JSON5 from 'json5';
  import _ from 'lodash';
  import { computed } from 'vue';
  import { WnObj } from '../../';

  const props = defineProps<{
    value: WnObj;
  }>();

  const Obj = computed(() => props.value || {});
  const hasObj = computed(() => (Obj.value.id ? true : false));
  const Meta = computed(() => _.omit(props.value, 'ancestors'));
</script>
<template>
  <div class="wn-obj-view">
    <header>Object: {{ Obj.id }}</header>
    <div>
      <span v-for="an in Obj.ancestors">{{ an.nm }} > </span>
      <span v-if="hasObj">{{ Obj.nm }}</span>
    </div>
    <hr />
    <pre>{{ JSON5.stringify(Meta, null, '  ') }}</pre>
  </div>
</template>
<style lang="scss" scoped>
  @use '@site0/tijs/scss' as *;

  .wn-obj-view {
    padding: 1em;
  }
</style>
