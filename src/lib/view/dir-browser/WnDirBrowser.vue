<script lang="ts" setup>
  import { TiLayoutGrid, TiLoading } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, onMounted, watch } from 'vue';
  import { WnObj, useDirStore, userGlobalStatusStore } from '../../';

  const props = defineProps<{
    value?: WnObj;
    moduleName?: string;
  }>();

  const Obj = computed(() => props.value || {});
  const hasObj = computed(() => (Obj.value.id ? true : false));
  const Meta = computed(() => _.omit(props.value, 'ancestors'));

  const DIR = useDirStore(props.moduleName);
  const _GS = userGlobalStatusStore();

  const GUILayout = computed(() => {
    return DIR.explainLayout();
  });
  const GUISchema = computed(() => {
    return DIR.explainSchema();
  });

  watch(
    () => props.value,
    (oDir, oldDir) => {
      console.log("oDir", oDir, "oldDir", oldDir)
      //_GS.set('loading', true);
      DIR.reload(oDir);
      //_GS.reset('loading');
    }, {
      immediate:true
    }
  );
</script>
<template>
  <div class="wn-dir-browser fit-parent pos-relative">
    <TiLayoutGrid v-bind="GUILayout" :schema="GUISchema" />
    <TiLoading mode="cover" v-if="_GS.is('loading')" />
  </div>
</template>
<style lang="scss" scoped>
  @use '@site0/tijs/scss' as *;
</style>
