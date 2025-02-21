<script lang="ts" setup>
  import { useGlobalStatus, WnHubSkyProps } from '@site0/ti-walnut';
  import { CssUtils, IconInput, TiIcon } from '@site0/tijs';
  import { computed } from 'vue';
  //--------------------------------------------------
  const props = defineProps<WnHubSkyProps>();
  //--------------------------------------------------
  const _global = useGlobalStatus();
  //--------------------------------------------------
  const TopClass = computed(() => CssUtils.mergeClassName(props.className));
  const TopStyle = computed(() => CssUtils.toStyle(props.style));
  //--------------------------------------------------
  const LogoIcon = computed(() => {
    let icon: IconInput;
    if (!_global.appLogo) {
      icon = 'fas-globe';
    }
    // 指定图标
    // else if(/^icon:/.test(status.appLogo)){

    // }
    // 默认就是图片
    else {
      icon = _global.appLogo;
    }
    return icon;
  });
  //--------------------------------------------------
  let emit = defineEmits<{
    (event: 'logout' | 'gohome'): void;
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
    <div class="as-part is-crumb">
      <div class="as-title">
        <strong>{{ _global.appTitle }}</strong>
        <div class="as-version">V {{ _global.appVersion }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @use './wn-hub-sky.scss';
</style>
