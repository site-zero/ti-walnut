import { Match, SideBarItem, TiMatch, Util } from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import { Walnut } from '../../core';
import { UserSidebar } from '../_types/wn-types';

const _sidebar = ref<UserSidebar>();

export type SideBarReloadOption = {
  pageHref?: string;
  pageSuffix?: string;
};

export function useSidebar() {
  async function reload(options: SideBarReloadOption = {}) {
    _sidebar.value = await Walnut.fetchSidebar();
    if (options.pageHref) {
      updateDocumentTitleByHref(options.pageHref, options.pageSuffix);
    }
  }

  function __get_item_by(
    items: SideBarItem[],
    am: TiMatch
  ): SideBarItem | undefined {
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        let it = items[i];
        if (am.test(it)) {
          return Util.jsonClone(it);
        }
        if (it.items && it.items.length > 0) {
          let subIt = __get_item_by(it.items, am);
          if (subIt) {
            return subIt;
          }
        }
      }
    }
  }

  function getItemBy(match: Partial<SideBarItem>): SideBarItem | undefined {
    let N = _sidebar.value?.sidebar.length ?? 0;
    if (N <= 0 || _.isEmpty(match)) {
      return;
    }
    let am = Match.parse(match);
    return __get_item_by(_sidebar.value?.sidebar ?? [], am);
  }

  function updateDocumentTitleByHref(href: string, suffix?: string) {
    let it = getItemBy({ href });
    let texts = [];
    if (suffix) {
      texts.push(suffix);
    }
    if (it && it.title) {
      texts.unshift(it.title);
    }
    let title = texts.join(' - ');
    if (document.title != title) {
      document.title = title;
    }
  }

  return {
    keepAt: computed(() => _sidebar.value?.statusStoreKey),
    sidebar: computed(() => _sidebar.value?.sidebar),
    reload,
    updateDocumentTitleByHref,
    getItemBy,
  };
}
