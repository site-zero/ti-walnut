<script lang="ts" setup>
  import {
    ActionBarEvent,
    BlockEvent,
    TiLayoutGrid,
    TiLoading,
    Vars,
  } from '@site0/tijs';
  import _ from 'lodash';
  import { computed, inject, ref, watch } from 'vue';
  import { WN_HUB_APP_INST } from '../../../_store';
  import { useHubArenaReload } from './use-hub-arena-reload';
  import { WnHubArenaProps } from './wn-hub-arena-types';
  //--------------------------------------------------
  const props = defineProps<WnHubArenaProps>();
  //--------------------------------------------------
  const _hub = inject(WN_HUB_APP_INST);
  //--------------------------------------------------
  const _arena_reload = computed(() => useHubArenaReload(props, _hub!.view));
  const _gui_context = ref<Vars>({});
  //--------------------------------------------------
  const GUILayout = computed(() =>
    _hub!.view.createGUILayout(
      _gui_context.value,
      _hub!.view.measure.viewMode.value
    )
  );
  //--------------------------------------------------
  const GUISchema = computed(
    () => _hub!.view.createGUISchema(_gui_context.value) ?? {}
  );
  //--------------------------------------------------
  function buildGUI(ctx?: Vars) {
    if (!ctx) {
      ctx = _hub!.view.createGUIContext();
    }

    // 创建主要操作菜单
    let actions = _hub!.view.createGUIActions(ctx);
    ctx.MainActions = actions;
    _hub?.setMainActions(actions);

    // 记录上下文
    _gui_context.value = ctx;
  }
  //--------------------------------------------------
  watch(
    () => props.hubPath,
    async () => {
      await _arena_reload.value();

      // 创建上下文
      buildGUI();
    },
    { immediate: true }
  );
  //--------------------------------------------------
  // 上下文需要更加细致一点的监控，如果实在发生了变动，
  // 才会更新，以便触发控件的更新
  watch(
    () => _hub!.view.createGUIContext(),
    (newCtx) => {
      // let diff = Util.getRecordDiff(_gui_context.value, newCtx);
      // console.log('newCtx', newCtx, _.isEqual(newCtx, _gui_context.value));
      // console.log('diff', diff);
      if (!_.isEqual(newCtx, _gui_context.value)) {
        buildGUI(newCtx);
      }
    },
    { deep: true }
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
