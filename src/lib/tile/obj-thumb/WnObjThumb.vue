<script lang="ts" setup>
  import { CssUtils, TiIcon, useBoxAspect } from "@site0/tijs";
  import { computed } from "vue";
  import { useObjThumbApi } from "./use-obj-thumb-api";
  import { WnObjThumbProps } from "./wn-obj-thumb-types";
  //-----------------------------------------------------
  const props = withDefaults(defineProps<WnObjThumbProps>(), {
    boxFontSize: "s",
    boxPadding: "t",
  });
  //-----------------------------------------------------
  const api = useObjThumbApi(props);
  //-----------------------------------------------------
  const Aspect = computed(() =>
    useBoxAspect(props, {
      getElement: () => null,
      getDockingElement: () => null,
      isFocused: () => false,
      isTipBoxReady: () => false,
      isReadonly: () => true,
      autoFloatWhenTipReady: () => false,
    })
  );
  //-----------------------------------------------------
  const TopClass = computed(() => {
    return Aspect.value.TopClass.value;
  });
  //-----------------------------------------------------
  const TopStyle = computed(() => {
    let css = {};
    if (props.getStyle) {
      css = props.getStyle(props.value || {});
    }
    return CssUtils.mergeStyles([Aspect.value.TopStyle.value, css]);
  });
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-obj-thumb" :class="TopClass" :style="TopStyle">
    <div class="part-icon"><TiIcon :value="api.ObjIcon.value" /></div>
    <div v-for="icon in api.PrefixIcons.value" class="part-icon">
      <TiIcon v-bind="icon" />
    </div>
    <div class="part-text">{{ api.ObjText.value }}</div>
    <div v-for="icon in api.SuffixIcons.value" class="part-icon">
      <TiIcon v-bind="icon" />
    </div>
  </div>
</template>
<style lang="scss">
  @use "./wn-obj-thumb.scss";
</style>
