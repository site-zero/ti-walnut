import {
  BlockProps,
  LayoutBlock,
  RoadblockProps,
  TabsLayoutProps,
} from '@site0/tijs';
import _ from 'lodash';
import { WnObjViewerApi } from './use-wn-obj-viewer';
import { WnObjViewerProps } from './wn-obj-viewer-types';

const _BUILTIN_BLOCKS: Record<string, BlockProps> = {
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
    let tab: LayoutBlock | undefined = undefined;
    // 看看用户是否定义了块实现
    if (props.blocks) {
      tab = _.omit(props.blocks[tabName], 'comType', 'comConf', 'dynamic');
    }
    // 采用内置块实现
    if (_.isEmpty(tab)) {
      tab = _BUILTIN_BLOCKS[tabName];
    }
    // 加入标签页
    if (tab) {
      blocks.push(tab);
    }
    // 加入一个占位标签页
    else {
      blocks.push({
        name: tabName,
        title: tabName,
        comType: 'TiRoadblock',
        comConf: {
          icon: 'fas-person-digging',
          text: `${tabName} in Building ... `,
        } as RoadblockProps,
      });
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
