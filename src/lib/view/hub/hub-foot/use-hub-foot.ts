import { ComTipsApi, CssUtils, useValuePipe, Util } from '@site0/tijs';
import _ from 'lodash';
import { HubView } from '../../../_store/hub';
import { FootValueContext, useHubFootTips } from './use-hub-foot-tips';
import {
  DisplayFootPart,
  DisplayFootPartItem,
  FootPart,
  FootPartItem,
  WnHubFootProps,
} from './wn-hub-foot-types';

/**
 * @name useHutFoot
 * @description 根据传入的属性构建并返回用于显示的底部部件数组。
 *
 * @param {WnHubFootProps} props 底部部件的属性，包含各个部件的配置信息。
 * @param {HubView} _hub_view Hub视图的实例，提供全局数据和会话数据。
 * @param {ComTipsApi} _tip_api 提示信息API，用于管理提示信息。
 *
 * @returns {DisplayFootPart[]} 用于显示的底部部件数组。
 *
 * @example
 * ```typescript
 * const footParts = useHutFoot(props, hubView, tipApi);
 * ```
 *
 * @remarks
 * 该函数主要负责将配置的底部部件转换为可直接用于渲染的格式。
 * 它会遍历 `props.parts` 中的每个部件，并调用 `buildPart` 函数来构建单个部件的显示信息。
 * 在构建过程中，会根据部件的类型进行特殊处理，例如选区和视图类型。
 * 对于每个部件中的 `items`，会调用 `build_item` 函数来构建单个条目的显示信息，并进行值的解释和格式化。
 */
export function useHutFoot(
  props: WnHubFootProps,
  _hub_view: HubView,
  _tip_api: ComTipsApi
): DisplayFootPart[] {
  //-----------------------------------------------
  // 准备上下文，用来渲染值和提示信息
  let ctx: FootValueContext = {
    G: _hub_view.global.data ?? {},
    session: _hub_view.session.data ?? {},
  };
  //-----------------------------------------------
  _tip_api.clear();
  let makeTip = useHubFootTips(props);
  //-----------------------------------------------
  function build_item(
    item: FootPartItem,
    index: number,
    partKey: string
  ): DisplayFootPartItem {
    // 准备返回值
    let re = {
      index,
      itemKey: `${partKey}-item-${index}`,
      ..._.omit(item, 'tip'),
    } as DisplayFootPartItem;

    // 获取返回值
    if (re.value) {
      re.value = Util.explainObj(ctx, re.value);
      re.rawValue = re.value;
    }

    // 格式化显示值
    if (re.value) {
      const pipe = useValuePipe(item);
      re.value = pipe(re.value);
    }

    // 记入提示信息
    let tip = makeTip(item.tip, ctx, re.value, re.rawValue);
    if (tip) {
      _tip_api.addTip({
        selector: `[data-item-key="${re.itemKey}"]`,
        ...tip,
      });
    }

    return re;
  }
  //-----------------------------------------------
  function buildPart(part: FootPart, index: number): DisplayFootPart {
    let displayPart = {
      index,
      uniqKey: `part-${index}`,
      type: part.type || 'default',
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
  } // buildPart
  //-----------------------------------------------
  // 准备构建返回值
  //-----------------------------------------------
  const parts: DisplayFootPart[] = [];
  _.forEach(props.parts, (fp, index) => {
    parts.push(buildPart(fp, index));
  });
  return parts;
}
