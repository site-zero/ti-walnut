import { TabsAspect, Vars } from '@site0/tijs';

export type WnObjViewerEmitter = {
  (event: 'show-content', contentIsShown: boolean): void;
  (event: 'meta-change', delta: Vars): void;
  (event: 'content-change', content: string): void;
};

export type WnObjViewerTabName = 'meta' | 'content';

export type WnObjViewerProps = TabsAspect & {
  meta?: Vars;

  // 对于 DIR 无论如何都是不显示的
  content?: string;

  // Tab 的顺序
  // 默认为 ['meta', 'content']
  tabs?: WnObjViewerTabName[];
};
