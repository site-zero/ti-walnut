import { CommonProps, IconInput } from '@site0/tijs';

export type WnObjThumbInfo = {
  title?: string;
  nm?: string;
  icon?: IconInput;
  race?: string;
  mime?: string;
  tp?: string;
};

export type WnObjThumbProps = CommonProps & {
  value?: WnObjThumbInfo;
};
