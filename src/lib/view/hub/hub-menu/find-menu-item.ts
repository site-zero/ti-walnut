import { ActionBarItem, Match, TiMatch } from '@site0/tijs';

function __menu_exists(items: ActionBarItem[], am: TiMatch): boolean {
  for (let item of items) {
    if (am.test(item)) {
      return true;
    }
    // 递归
    if (item.items) {
      if (__menu_exists(item.items, am)) {
        return true;
      }
    }
  }
  return false;
}

export function menuExists(items: ActionBarItem[], match: any): boolean {
  let am = Match.parse(match);
  return __menu_exists(items, am);
}
