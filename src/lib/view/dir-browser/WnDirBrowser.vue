<script lang="ts" setup>
  import { TiLayoutGrid, TiLoading } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, watch } from 'vue';
  import { WnObj, useDirStore, useGlobalStatus } from '../../';

  const props = defineProps<{
    value?: WnObj;
    moduleName?: string;
  }>();

  const Obj = computed(() => props.value || {});
  const hasObj = computed(() => (Obj.value.id ? true : false));
  const Meta = computed(() => _.omit(props.value, 'ancestors'));

  const DIR = useDirStore(props.moduleName);
  const _GS = useGlobalStatus();

  const GUILayout = computed(() => {
    return DIR.explainLayout();
  });
  const GUISchema = computed(() => {
    return DIR.explainSchema();
  });

  watch(
    () => props.value,
    (oDir, oldDir) => {
      console.log('oDir', oDir, 'oldDir', oldDir);
      //_GS.set('loading', true);
      DIR.reload(oDir);
      //_GS.reset('loading');
    },
    {
      immediate: true,
    }
  );
</script>
<template>
  <div class="wn-dir-browser fit-parent pos-relative">
    <TiLayoutGrid v-bind="GUILayout" :schema="GUISchema" />
    <TiLoading
      v-if="_GS.loading"
      class="is-track"
      mode="cover"
      opacity="faint" />
  </div>
</template>
<style lang="scss" scoped>
  @use '@site0/tijs/scss' as *;
</style>
