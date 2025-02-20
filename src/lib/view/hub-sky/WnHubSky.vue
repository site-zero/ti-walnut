<script lang="ts" setup>
  import { useGlobalStatus } from '@site0/ti-walnut';
  import { IconInput, TiIcon } from '@site0/tijs';
  import { computed } from 'vue';
  //--------------------------------------------------
  const _global = useGlobalStatus();
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
  <div class="wn-hub-sky fit-parent">
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
