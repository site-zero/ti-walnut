import { TiStore } from "@site0/tijs";

import _ from "lodash";

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

  return {
    getTheme,
    setTheme,
    saveTheme,
    restoreTheme,
  };
}
