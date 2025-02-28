<script lang="ts" setup>
  import {
    ActionBarEvent,
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
  const DIR = useDirStore({ name: props.moduleName });
  const _gb_sta = useGlobalStatus();
  //-----------------------------------------------------
  const GUILayout = computed(() => DIR.explainLayout());
  const GUISchema = computed(() => DIR.explainSchema());
  //-----------------------------------------------------
  function onBlock(event: BlockEvent) {
    let { eventName, data } = event;
    console.log('onBlock', event);
    // 选择列表
    if ('list-select' == eventName) {
      let { currentId, checkedIds } = data;
      DIR.updateSelection(currentId, checkedIds);
    }
    // 修改原数据
    else if ('meta-change' == eventName) {
      DIR.updateAndSave(data);
    }
    // 修改内容
    else if ('content-change' == eventName) {
      DIR.setContent(data);
    }
    // 警告
    else {
      console.warn(`Fail to handle event '${eventName}' data=`, data);
    }
  }
  //-----------------------------------------------------
  function onTabChange(event: GridItemTabChangeEvent) {
    let tabName = event?.to?.value;
    DIR.guiNeedContent.value = 'content' == tabName;
    DIR.autoLoadContent();
  }
  //-----------------------------------------------------
  function onActionFire(event: ActionBarEvent) {
    let { name, payload } = event;
    DIR.invoke(name, payload);
  }
  //-----------------------------------------------------
  watch(
    () => props.value,
    (oDir, _oldDir) => {
      //console.log('oDir', oDir, 'oldDir', oldDir);
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
      <TiActionBar
        v-bind="DIR.actions.value"
        :vars="DIR.actionStatus"
        @fire="onActionFire" />
    </header>
    <main class="pos-relative">
      <TiLayoutGrid
        v-bind="GUILayout"
        :schema="GUISchema"
        @block="onBlock"
        @tab-change="onTabChange" />
      <TiLoading
        v-if="_gb_sta.data.loading"
        class="is-track"
        mode="cover"
        opacity="faint" />
    </main>
  </div>
</template>
<style lang="scss" scoped>
  @use './wn-dir-browser.scss';
</style>
