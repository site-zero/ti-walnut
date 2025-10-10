<script lang="ts" setup>
  import { CssUtils, IconInput, TiIcon } from "@site0/tijs";
  import { computed } from "vue";
  import { useGlobalStatus, WnHubAvatar, WnHubMenu } from "../../../../lib";
  import { WnHubSkyProps } from "./wn-hub-sky-types";
  //--------------------------------------------------
  const props = defineProps<WnHubSkyProps>();
  //--------------------------------------------------
  const _gb_sta = useGlobalStatus();
  //--------------------------------------------------
  const TopClass = computed(() => CssUtils.mergeClassName(props.className));
  const TopStyle = computed(() => CssUtils.toStyle(props.style));
  //--------------------------------------------------
  const LogoIcon = computed(() => {
    let icon: IconInput;
    if (!_gb_sta.data.appLogo) {
      icon = "fas-globe";
    }
    // 指定图标
    // else if(/^icon:/.test(status.appLogo)){

    // }
    // 默认就是图片
    else {
      icon = _gb_sta.data.appLogo;
    }
    return icon;
  });
  //--------------------------------------------------
  let emit = defineEmits<{
    (event: "logout" | "gohome"): void;
  }>();
  //--------------------------------------------------
</script>

<template>
  <div class="wn-hub-sky fit-parent" :class="TopClass" :style="TopStyle">
    <div class="as-part is-logo">
      <a @click="emit('gohome')">
        <!--img :src="status.appLogo" -->
        <TiIcon :value="LogoIcon" />
      </a>
    </div>
    <div class="as-part is-name">
      <div class="as-title">
        <strong>{{ _gb_sta.data.appTitle }}</strong>
        <div class="as-version">V {{ _gb_sta.data.appVersion }}</div>
      </div>
    </div>
    <div class="as-part is-crumb">
      appPath: [{{ _gb_sta.data.appPath }}]
    </div>
    <div class="as-part is-avatar">
      <WnHubAvatar @logout="emit('logout')"/>
    </div>
    <div class="as-part is-menu">
      <WnHubMenu @logout="emit('logout')"/>
    </div>
  </div>
</template>

<style lang="scss">
  @use "./wn-hub-sky.scss";
</style>
