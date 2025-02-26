import { TabsAspect, Vars } from '@site0/tijs';

export type WnObjViewerProps = TabsAspect & {
  meta?: Vars;

  // 对于 DIR 无论如何都是不显示的
  content?: string;
};
