<script lang="ts" setup>
  import {
    ActionBarItem,
    ActionBarProps,
    CrumbProps,
    TiActionBar,
    TiCrumb,
  } from "@site0/tijs";
  import { computed } from "vue";
  import { getWnObjIcon } from "../../../../../core";
  import { useSkyBarActions } from "./use-wob-skybar-actions";
  import {
    WnObjBrowserSkyBarEmitter,
    WnObjBrowserSkyBarProps,
  } from "./wob-skybar-types";
  //-----------------------------------------------------
  const emit = defineEmits<WnObjBrowserSkyBarEmitter>();
  const props = withDefaults(defineProps<WnObjBrowserSkyBarProps>(), {});
  //-----------------------------------------------------
  const CrumbConfig = computed((): CrumbProps => {
    return {
      style: {
        padding: "4px 8px",
      },
      // head: {
      //   prefixIcon: "fas-desktop",
      //   suffixIcon: "zmdi-chevron-right",
      // },
      getValue: "id",
      getIcon: (obj) => getWnObjIcon(obj, "fas-cube"),
      getText: (obj) => obj.title || obj.nm || obj.id,
    };
  });
  //-----------------------------------------------------
  const ActionBarConfig = computed((): ActionBarProps => {
    const menu = useSkyBarActions(props, emit);
    const items: ActionBarItem[] = [];
    
    // 切换详情显示
    items.push(menu.forToggleDetail());
    // 切换模式
    items.push(menu.forGalleryMode());
    // 刷新按钮
    items.push(menu.forRefresh());
    
    // 最有返回菜单项目
    return {
      itemAlign: "right",
      items,
    };
  });
  //-----------------------------------------------------
</script>
<template>
  <div class="wob-skybar">
    <div class="part-left">
      <TiCrumb
        v-bind="CrumbConfig"
        :data="props.objPath"
        :value="props.objId" />
    </div>
    <div class="part-right">
      <TiActionBar v-bind="ActionBarConfig" :vars="props.menuVars" />
    </div>
  </div>
</template>
<style lang="scss">
  @use "./wob-skybar.scss";
</style>
