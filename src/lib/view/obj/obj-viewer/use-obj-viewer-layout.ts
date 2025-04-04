import { LayoutBlock, TabsLayoutProps } from '@site0/tijs';
import { WnObjViewerApi } from './use-wn-obj-viewer';
import { WnObjViewerBlocks, WnObjViewerProps } from './wn-obj-viewer-types';

const _blocks: WnObjViewerBlocks = {
  meta: {
    icon: 'zmdi-info',
    name: 'meta',
    title: 'i18n:wn-obj-viewer-tab-title-meta',
  },
  preview: {
    icon: 'zmdi-eye',
    name: 'preview',
    title: 'i18n:wn-obj-viewer-tab-title-preview',
  },
  content: {
    icon: 'fa-solid fa-pen-to-square',
    name: 'content',
    title: 'i18n:wn-obj-viewer-tab-title-edit',
  },
};

export function useObjViewerLayout(
  props: WnObjViewerProps,
  _api: WnObjViewerApi
): TabsLayoutProps {
  // 获取内容块
  let blocks = [] as LayoutBlock[];
  for (let tabName of props.tabs ?? ['meta', 'preview', 'content']) {
    let tab = _blocks[tabName];
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
