import {
  BoxAspectProps,
  CommonProps,
  IconInput,
  IconProps,
  Vars,
} from "@site0/tijs";

export type WnObjThumbInfo = {
  title?: string;
  nm?: string;
  icon?: IconInput;
  race?: string;
  mime?: string;
  tp?: string;
};

export type WnObjThumbProps = CommonProps &
  BoxAspectProps & {
    value?: Vars;
    getStyle?: (obj: Vars) => Vars;
    getPrefixIcons?: (obj: Vars) => IconProps[];
    getSuffixIcons?: (obj: Vars) => IconProps[];
  };
