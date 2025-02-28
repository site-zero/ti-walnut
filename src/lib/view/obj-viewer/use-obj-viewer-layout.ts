import { LayoutBlock, TabsLayoutProps } from '@site0/tijs';
import { WnObjViewerApi } from './use-wn-obj-viewer';
import { WnObjViewerProps } from './wn-obj-viewer-types';

const _tabs = {
  meta: {
    icon: 'zmdi-info',
    name: 'meta',
    title: 'i18n:wn-obj-viewer-tab-title-meta',
  },
  content: {
    icon: 'zmdi-eye',
    name: 'content',
    title: 'i18n:wn-obj-viewer-tab-title-content',
  },
};

export function useObjViewerLayout(
  props: WnObjViewerProps,
  _api: WnObjViewerApi
): TabsLayoutProps {
  // 获取内容块
  let blocks = [] as LayoutBlock[];
  for (let tabName of props.tabs ?? ['meta', 'content']) {
    let tab = _tabs[tabName];
    if (tab) {
      blocks.push(tab);
    }
  }
  return {
    tabsAlign: props.tabsAlign,
    tabsAt: props.tabsAt,
    tabItemSpace: props.tabItemSpace,
    wrapTabs: props.wrapTabs,
    tabMaxWidth: props.tabMaxWidth,
    defaultTab: props.defaultTab,
    keepTab: props.keepTab,
    blocks,
  };
}
