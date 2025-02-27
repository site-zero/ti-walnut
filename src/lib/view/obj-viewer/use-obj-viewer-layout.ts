import { TabsLayoutProps } from '@site0/tijs';
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
      { icon: 'zmdi-info', name: 'meta', title: '属性' },
      { icon: 'zmdi-eye', name: 'content', title: '查看' },
    ],
  };
}
