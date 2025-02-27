import { TabsAspect, Vars } from '@site0/tijs';

export type WnObjViewerEmitter = {
  (event: 'show-content', contentIsShown: boolean): void;
  (event: 'meta-change', delta: Vars): void;
  (event: 'content-change', content: string): void;
};

export type WnObjViewerProps = TabsAspect & {
  meta?: Vars;

  // 对于 DIR 无论如何都是不显示的
  content?: string;
};
