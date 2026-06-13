<script lang="ts" setup>
  import { TiIcon } from "@site0/tijs";
  import { computed, useTemplateRef } from "vue";
  import { useWnObjTitleApi } from "./use-wn-obj-title-api";
  import { WnObjTitleEmitter, WnObjTitleProps } from "./wn-obj-title-types";
  //-----------------------------------------------------
  const $text = useTemplateRef("text");
  //-----------------------------------------------------
  const emit = defineEmits<WnObjTitleEmitter>();
  const props = withDefaults(defineProps<WnObjTitleProps>(), {});
  const api = useWnObjTitleApi(props, {
    emit,
    getTextElement: () => $text.value,
  });
  //-----------------------------------------------------
  const TopClass = computed(() => ({
    "is-editing": api.isEditing.value,
  }));
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-obj-title" :class="TopClass" ref="text">
    <div class="as-icon is-info">
      <TiIcon :value="api.ObjIcon.value" />
    </div>
    <div class="as-text" @dblclick.left="api.onEdit">
      {{ api.TitleText.value }}
    </div>
    <div class="as-icon is-menu">
      <a @click.left="api.onEdit"
      data-tip="Edit Title"
      ><i class="fa-solid fa-pen-to-square"></i></a>
    </div>
  </div>
</template>
<style lang="scss">
  @use "./wn-obj-title.scss";
</style>
