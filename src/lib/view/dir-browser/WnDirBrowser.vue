<script lang="ts" setup>
  import JSON5 from 'json5';
  import _ from 'lodash';
  import { computed, onMounted, watch } from 'vue';
  import { WnObj, defineDirStore } from '../../';

  const props = defineProps<{
    value?: WnObj;
    moduleName?: string;
  }>();

  const Obj = computed(() => props.value || {});
  const hasObj = computed(() => (Obj.value.id ? true : false));
  const Meta = computed(() => _.omit(props.value, 'ancestors'));

  const useStore = defineDirStore(props.moduleName);
  const Store = useStore();

  watch(
    () => props.value,
    (oDir) => {
      Store.reload(oDir);
    }
  );

  onMounted(() => {
    Store.reload(props.value);
  });
</script>
<template>
  <div class="wn-dir-browser">
    <header>Browser: {{ Obj.id }}</header>
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

  .wn-dir-browser {
    padding: 1em;
  }
</style>
