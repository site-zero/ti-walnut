<script lang="ts" setup>
  import { I18n, StrOptionItem, TiIcon } from "@site0/tijs";
  import { computed } from "vue";
  import { getAvailableThemes, useWnGUITheme } from "../../../core";
  import {
    WnSetupThemeEmitter,
    WnSetupThemeProps,
  } from "./wn-setup-theme-types";
  //-----------------------------------------------------
  const emit = defineEmits<WnSetupThemeEmitter>();
  const props = withDefaults(defineProps<WnSetupThemeProps>(), {
    value: "auto-color-mode",
  });
  //-----------------------------------------------------
  const _theme = computed(() => useWnGUITheme({ themeKey: props.themeKey }));
  //-----------------------------------------------------
  const ThemeItems = computed(() => {
    let themeData = getAvailableThemes() ?? [];
    let items: StrOptionItem[] = [];
    for (let li of themeData) {
      let current = li.value == props.value;
      items.push({
        ...li,
        className: current ? "is-current" : undefined,
      });
    }
    return items;
  });
  //-----------------------------------------------------
  function onClickThemeItem(it: StrOptionItem) {
    emit("change", it.value);
    if (props.autoPreview) {
      _theme.value.setTheme(it.value);
    }
  }
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-gui-theme-setup">
    <h4>{{ I18n.text("i18n:theme-setup") }}</h4>
    <main>
      <template v-for="it in ThemeItems">
        <dl
          :class="it.className"
          :data-theme="it.value"
          @click.stop="onClickThemeItem(it)">
          <dt><TiIcon :value="it.icon" /></dt>
          <dd>{{ I18n.text(it.text!) }}</dd>
        </dl>
      </template>
    </main>
  </div>
</template>
<style lang="scss" scoped>
  @use "./wn-setup-theme.scss";
</style>
