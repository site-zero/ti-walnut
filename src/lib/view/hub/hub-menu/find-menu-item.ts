import { ActionBarItemRefer, Match, TiMatch } from "@site0/tijs";
import _ from "lodash";

function __menu_exists(items: ActionBarItemRefer[], am: TiMatch): boolean {
  for (let item of items) {
    if (am.test(item)) {
      return true;
    }
    // 递归
    let subItems = _.get(item, "items");
    if (_.isArray(subItems)) {
      if (__menu_exists(subItems, am)) {
        return true;
      }
    }
  }
  return false;
}

export function menuExists(items: ActionBarItemRefer[], match: any): boolean {
  let am = Match.parse(match);
  return __menu_exists(items, am);
}
