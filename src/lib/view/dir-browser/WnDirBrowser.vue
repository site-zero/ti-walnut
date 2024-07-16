<script lang="ts" setup>
  import {
    BlockEvent,
    GridItemTabChangeEvent,
    TiActionBar,
    TiLayoutGrid,
    TiLoading,
  } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, watch } from 'vue';
  import { WnObj, useDirStore, useGlobalStatus } from '../../';
  //-----------------------------------------------------
  const props = defineProps<{
    value?: WnObj;
    moduleName?: string;
  }>();
  //-----------------------------------------------------
  const Obj = computed(() => props.value || {});
  const hasObj = computed(() => (Obj.value.id ? true : false));
  const Meta = computed(() => _.omit(props.value, 'ancestors'));
  //-----------------------------------------------------
  const DIR = useDirStore(props.moduleName);
  const _GS = useGlobalStatus();
  //-----------------------------------------------------
  const GUILayout = computed(() => {
    return DIR.explainLayout();
  });
  const GUISchema = computed(() => {
    return DIR.explainSchema();
  });
  //-----------------------------------------------------
  function onBlock(event: BlockEvent) {
    let { eventName, data } = event;
    // 选择列表
    if ('list-select' == eventName) {
      let { currentId, checkedIds } = data;
      DIR.updateSelection(currentId, checkedIds);
      console.log(data);
    }
    // 修改原数据
    else if ('meta-change' == eventName) {
      DIR.updateAndSave(data);
    }
    // 警告
    else {
      console.warn(`Fail to handle event '${eventName}' data=`, data);
    }
  }
  //-----------------------------------------------------
  function onTabChange(event: GridItemTabChangeEvent) {
    let tabName = event?.to?.value;
    console.log('---------->', tabName);
    DIR.guiNeedContent.value = 'content' == tabName;
  }
  //-----------------------------------------------------
  watch(
    () => props.value,
    (oDir, oldDir) => {
      console.log('oDir', oDir, 'oldDir', oldDir);
      DIR.reload(oDir);
    },
    {
      immediate: true,
    }
  );
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-dir-browser fit-parent">
    <header v-if="!_.isEmpty(DIR.actions.value)">
      <TiActionBar v-bind="DIR.actions.value" />
    </header>
    <main class="pos-relative">
      <TiLayoutGrid
        v-bind="GUILayout"
        :schema="GUISchema"
        @block="onBlock"
        @tab-change="onTabChange" />
      <TiLoading
        v-if="_GS.loading"
        class="is-track"
        mode="cover"
        opacity="faint" />
    </main>
  </div>
</template>
<style lang="scss" scoped>
  @use '@site0/tijs/scss' as *;
  @import './wn-dir-browser.scss';
</style>
