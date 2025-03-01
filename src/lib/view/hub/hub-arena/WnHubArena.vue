<script lang="ts" setup>
  import {
    ActionBarEvent,
    BlockEvent,
    TiLayoutGrid,
    TiLoading,
    Vars,
  } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, inject, watch } from 'vue';
  import { WN_HUB_APP_INST } from '../../../_store';
  import { useHubArenaReload } from './use-hub-arena-reload';
  import { WnHubArenaProps } from './wn-hub-arena-types';
  //--------------------------------------------------
  const props = defineProps<WnHubArenaProps>();
  //--------------------------------------------------
  const _hub = inject(WN_HUB_APP_INST);
  //--------------------------------------------------
  const _arena_reload = computed(() => useHubArenaReload(props, _hub!.view));
  //--------------------------------------------------
  const GUIAction = computed(() => {
    let ctx = _hub!.view.createGUIContext();
    return _hub!.view.createGUIActions(ctx);
  });
  //--------------------------------------------------
  const GUIContext = computed(() => {
    let re: Vars = _hub!.view.createGUIContext() ?? {};
    re.MainActions = GUIAction.value;
    return re;
  });
  //--------------------------------------------------
  const GUILayout = computed(() =>
    _hub!.view.createGUILayout(
      GUIContext.value,
      _hub!.view.measure.viewMode.value
    )
  );
  //--------------------------------------------------
  const GUISchema = computed(
    () => _hub!.view.createGUISchema(GUIContext.value) ?? {}
  );
  //--------------------------------------------------
  watch(
    () => props.hubPath,
    async () => {
      await _arena_reload.value();
      let actions = _.cloneDeep(GUIAction.value);
      _hub?.setMainActions(actions);
    },
    { immediate: true }
  );
  //--------------------------------------------------
  function onBlock(event: BlockEvent) {
    _hub!.view.onBlockEvent(event);
  }
  function onFire(event: ActionBarEvent) {
    _hub!.view.onActionFire(event);
  }
  //--------------------------------------------------
</script>
<template>
  <div class="wn-hub-arena fit-parent">
    <TiLoading
      v-if="_hub!.view.isViewLoading"
      text="Loading View ..."
      mode="cover"
      :opacity="0.618" />
    <TiLayoutGrid
      v-bind="GUILayout"
      :schema="GUISchema"
      @block="onBlock"
      @fire="onFire" />
  </div>
</template>
