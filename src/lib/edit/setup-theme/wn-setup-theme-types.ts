import { CommonProps, StrOptionItem } from "@site0/tijs";

export type WnSetupThemeEmitter = {
  (event: "change", payload: any): void;
};

export type WnSetupThemeProps = CommonProps & {
  themeKey?: string;
  value: string;
  autoPreview?: boolean;
};

