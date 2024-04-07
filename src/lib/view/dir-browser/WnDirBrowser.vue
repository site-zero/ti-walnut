<script lang="ts" setup>
  import { TiLayoutGrid, Util } from '@site0/tijs';
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

  const useDirStore = defineDirStore(props.moduleName);
  const DIR = useDirStore();

  const GUILayout = computed(() => {
    return Util.explainObj(DIR.GUIContext, DIR.layout);
  });
  const GUISchema = computed(() => {
    return Util.explainObj(DIR.GUIContext, DIR.schema);
  });

  watch(
    () => props.value,
    (oDir) => {
      DIR.reload(oDir);
    }
  );

  onMounted(() => {
    DIR.reload(props.value);
  });
</script>
<template>
  <div class="wn-dir-browser fit-parent">
    <TiLayoutGrid v-bind="GUILayout" :schema="GUISchema" />
  </div>
</template>
<style lang="scss" scoped>
  @use '@site0/tijs/scss' as *;
</style>
