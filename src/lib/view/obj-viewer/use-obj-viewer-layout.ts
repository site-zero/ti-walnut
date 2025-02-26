import { LayoutBlock, TabsLayoutProps } from '@site0/tijs';
import { WnObjViewerApi } from './use-wn-obj-viewer';
import { WnObjViewerProps } from './wn-obj-viewer-types';

export function useObjViewerLayout(
  props: WnObjViewerProps,
  _api: WnObjViewerApi
): TabsLayoutProps {
  return {
    tabsAlign: props.tabsAlign,
    tabsAt: props.tabsAt,
    tabItemSpace: props.tabItemSpace,
    wrapTabs: props.wrapTabs,
    tabMaxWidth: props.tabMaxWidth,
    defaultTab: props.defaultTab,
    keepTab: props.keepTab,
    blocks: [
      { icon: 'zmdi-info', name: 'meta' },
      { icon: 'fas-file', name: 'content' },
    ],
  };
}
