<script lang="ts" setup>
  import {
    ActionBarEvent,
    BlockEvent,
    getGUIExplainContext,
    TiLayoutGrid,
    TiLoading,
    Util,
    Vars,
  } from "@site0/tijs";
  import _ from "lodash";
  import { computed, inject, ref, watch } from "vue";
  import { WN_HUB_APP_INST } from "../../../_store";
  import { useHubArenaReload } from "./use-hub-arena-reload";
  import { WnHubArenaProps } from "./wn-hub-arena-types";
  import { Walnut } from "../../../../core";
  //--------------------------------------------------
  const props = defineProps<WnHubArenaProps>();
  //--------------------------------------------------
  const _hub = inject(WN_HUB_APP_INST);
  //--------------------------------------------------
  const _arena_reload = computed(() => useHubArenaReload(props, _hub!.view));
  const _gui_context = ref<Vars>({});
  const _last_watch = ref<Vars>({});
  //--------------------------------------------------
  const GUILayout = computed(() =>
    _hub!.view.createGUILayout(
      { ..._gui_context.value, Ti: getGUIExplainContext() },
      _hub!.view.measure.viewMode.value
    )
  );
  //--------------------------------------------------
  const GUISchema = computed(
    () =>
      _hub!.view.createGUISchema({
        ..._gui_context.value,
        Ti: getGUIExplainContext(),
      }) ?? {}
  );
  //--------------------------------------------------
  function buildGUI() {
    let ctx = _hub!.view.createGUIContext();

    // 创建主要操作菜单
    let actions = _hub!.view.createGUIActions({
      ..._gui_context.value,
      Ti: getGUIExplainContext(),
    });
    ctx.MainActions = actions;
    _hub?.setMainActions(actions);

    // 记录上下文
    _gui_context.value = ctx;
  }
  //--------------------------------------------------
  watch(
    () => props.hubPath,
    async () => {
      const after_dynamic_ui_ready = async () => {
        await _arena_reload.value();
        buildGUI();
      };

      // 动态 UI 相关的配置是否已经加载完毕
      if (Walnut.isDynamicUIReady) {
        await after_dynamic_ui_ready();
      }
      // 动态 UI 相关的配置还没有加载完毕，仅仅注册一个回调
      else {
        Walnut.afterDynamicUIReady = after_dynamic_ui_ready;
      }
    },
    { immediate: true }
  );
  //--------------------------------------------------
  // 上下文需要更加细致一点的监控，如果实在发生了变动，
  // 才会更新，以便触发控件的更新
  watch(
    () => _hub!.view.createWatchingObj(),
    (newCtx) => {
      // console.log("watch:guiObj", newCtx);
      let diff = Util.getRecordDiffDeeply(_last_watch.value, newCtx);
      //console.log('watch:createWatchingObj()', diff);
      if (!_.isEmpty(diff)) {
        _last_watch.value = newCtx;
        buildGUI();
      }
    },
    { deep: true }
  );
  //--------------------------------------------------
  // watch(
  //   () => _hub!.view.session.data.ticket,
  //   () => {
  //     console.log("watch:ticket", _hub!.view.session.hasTicket.value);
  //     if (_hub!.view.session.hasTicket.value) {
  //       buildGUI();
  //     }
  //   }
  // );
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
