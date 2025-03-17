import {
  ComTipsApi,
  CssUtils,
  IconInput,
  useValuePipe,
  Util,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { HubView } from '../../../_store/hub';
import {
  FootPart,
  FootPartItem,
  FootPartItemType,
  FootPartType,
  WnHubFootProps,
} from './wn-hub-foot-types';

export type DisplayFootPartItem = FootPartItem & {
  index: number;
  itemKey: string;
  type: FootPartItemType;
  rawValue: string;
};

export type DisplayFootPart = {
  index: number;
  uniqKey: string;
  type: FootPartType;
  icon?: IconInput;
  text?: string;
  suffix?: string;
  style?: Vars;
  items: DisplayFootPartItem[];
};

export function useHutFoot(
  props: WnHubFootProps,
  _hub_view: HubView,
  _tip_api: ComTipsApi
): DisplayFootPart[] {
  //-----------------------------------------------
  let info = _hub_view.global.data.currentObj ?? {};
  _tip_api.clear();
  //-----------------------------------------------
  function build_item(
    item: FootPartItem,
    index: number,
    partKey: string
  ): DisplayFootPartItem {
    let re = {
      index,
      itemKey: `${partKey}-item-${index}`,
      ...item,
    } as DisplayFootPartItem;
    if (re.value) {
      re.value = Util.explainObj(info, re.value);
      re.rawValue = re.value;
    }
    if (re.value) {
      const pipe = useValuePipe(item);
      re.value = pipe(re.value);
    }

    return re;
  }
  //-----------------------------------------------
  function buildPart(part: FootPart, index: number): DisplayFootPart {
    let displayPart = {
      index,
      uniqKey: `part-${index}`,
      type: part.type || 'current',
      icon: part.icon,
      text: part.text,
      suffix: part.suffix,
      style: CssUtils.mergeStyles(
        { justifyContent: part.align, flex: part.flex },
        part.style
      ),
      items: [],
    } as DisplayFootPart;

    // 特殊处理：选区
    if ('selection' == displayPart.type) {
      let val = [_hub_view.global.data.selectedRows ?? 0].join('');
      displayPart.items.push({
        index: 0,
        itemKey: `${displayPart.uniqKey}-item-0`,
        type: 'text',
        text: 'i18n:wn-hub-foot-selected',
        value: val,
        rawValue: val,
      });
    }
    // 特殊处理：视图
    else if ('view' == displayPart.type) {
      let val = _hub_view.global.data.viewName ?? '---';
      displayPart.items.push({
        index: 0,
        itemKey: `${displayPart.uniqKey}-item-0`,
        type: 'text',
        value: val,
        rawValue: val,
      });
    }
    // 通用处理
    if (part.items) {
      for (let i = 0; i < part.items.length; i++) {
        displayPart.items.push(
          build_item(part.items[i], i, displayPart.uniqKey)
        );
      }
    }

    return displayPart;
  }
  //-----------------------------------------------
  // 准备构建返回值
  //-----------------------------------------------
  const parts: DisplayFootPart[] = [];
  _.forEach(props.parts, (fp, index) => {
    parts.push(buildPart(fp, index));
  });
  return parts;
}
