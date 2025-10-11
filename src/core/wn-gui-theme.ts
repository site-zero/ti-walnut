import { openAppModal, StrOptionItem, TiStore } from "@site0/tijs";

import _ from "lodash";
import { WnSetupThemeProps } from "../lib";

export type WnGUIThemeOptions = {
  themeKey?: string;
  defaultTheme?: string;
};

export function useWnGUITheme(options?: WnGUIThemeOptions) {
  const themeKey = options?.themeKey || "Wn-GUI-Theme";
  const defaultTheme = options?.defaultTheme || "auto-color-mode";

  //
  // 主题相关的接口
  //
  function getTheme() {
    return _.trim(document.documentElement.className);
  }

  function setTheme(themeName: string) {
    document.documentElement.className = themeName;
  }

  function saveTheme() {
    const themeName = _.trim(document.documentElement.className);

    if (themeName) {
      TiStore.local.set(themeKey, themeName);
    } else {
      TiStore.local.remove(themeKey);
    }
  }

  function restoreTheme() {
    const themeName = TiStore.local.getString(themeKey) || defaultTheme;
    setTheme(themeName);
  }

  async function setupTheme() {
    let themeName = getTheme();

    let newName = await openAppModal({
      icon: "fas-palette",
      title: "i18n:theme",
      position: "top",
      type: "info",
      width: "480px",
      height: "320px",
      clickMaskToClose: true,
      result: themeName,
      comType: "WnSetupTheme",
      comConf: {
        themeKey,
        autoPreview: true,
      } as WnSetupThemeProps,
    });

    // 用户取消
    if (!newName) {
      return;
    }

    // 应用新主题
    setTheme(newName);
    saveTheme();
  }

  return {
    defaultTheme,
    getTheme,
    setTheme,
    saveTheme,
    restoreTheme,
    setupTheme,
  };
}

export function getAvailableThemes(): StrOptionItem[] {
  return [
    {
      icon: "fas-cloud-sun",
      value: "auto-color-mode",
      text: "i18n:theme-auto",
    },
    { icon: "fas-moon", value: "dark", text: "i18n:theme-dark" },
    { icon: "fas-sun", value: "light", text: "i18n:theme-light" },
  ];
}
