import { TiComSet } from "@site0/tijs";
import { WnSetupThemeInfo } from "./setup-theme/wn-setup-theme-index";
import { WnSliderEditorInfo } from "./slider-editor/wn-slider-editor-index";

export default {
  WnSliderEditor: WnSliderEditorInfo,
  WnSetupTheme: WnSetupThemeInfo,
} as TiComSet;

export * from "./setup-theme/wn-setup-theme-index";
export * from "./slider-editor/wn-slider-editor-index";
