<script lang="ts" setup>
  import { TI_APP_TIPS, TiActionBar, TiIcon } from "@site0/tijs";
  import { computed, onUnmounted, useTemplateRef, watch } from "vue";
  import { useWnObjTitleActions } from "./use-wn-obj-title-actons";
  import { useWnObjTitleApi } from "./use-wn-obj-title-api";
  import { WnObjTitleEmitter, WnObjTitleProps } from "./wn-obj-title-types";
  //-----------------------------------------------------
  const $text = useTemplateRef("text");
  const _tip_api = TI_APP_TIPS.api;
  //-----------------------------------------------------
  const emit = defineEmits<WnObjTitleEmitter>();
  const props = withDefaults(defineProps<WnObjTitleProps>(), {});
  //--------------------------------------------------
  const api = useWnObjTitleApi(props, {
    emit,
    getTextElement: () => $text.value,
    getTipsApi: () => _tip_api,
  });
  //-----------------------------------------------------
  const ActionConfig = useWnObjTitleActions(props, api);
  //-----------------------------------------------------
  const TopClass = computed(() => ({
    "is-editing": api.isEditing.value,
  }));
  //-----------------------------------------------------
  watch(
    () => props.meta,
    () => {
      api.registerTip();
    },
    { immediate: true }
  );
  //--------------------------------------------------
  onUnmounted(() => {
    api.deposeTip();
  });
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-obj-title" :class="TopClass" ref="text">
    <div class="as-info">
      <template v-if="props.prefixIcons">
        <div class="info-icon" v-for="pi in props.prefixIcons">
          <TiIcon v-bind="pi" />
        </div>
      </template>
      <div class="info-icon">
        <TiIcon :value="api.ObjIcon.value" :tip="api.TitleTip.value" />
      </div>
    </div>
    <div class="as-text" @dblclick.left="api.onEdit">
      {{ api.TitleText.value }}
    </div>
    <div class="as-menu">
      <TiActionBar v-bind="ActionConfig" />
    </div>
  </div>
</template>
<style lang="scss">
  @use "./wn-obj-title.scss";
</style>
