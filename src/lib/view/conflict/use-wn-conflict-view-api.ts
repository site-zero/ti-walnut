import { ConflictItem, ConflictItemValue } from "@site0/tijs";
import _ from "lodash";
import { computed } from "vue";
import {
  WnConflictFieldInfo,
  WnConflictItemInfo,
  WnConflictSectionInfo,
} from "./_conflict_view_inner_types";
import { WnConflictViewProps } from "./wn-conflict-view-types";

export type WnConflictViewApi = ReturnType<typeof useWnConflictViewApi>;

export function useWnConflictViewApi(props: WnConflictViewProps) {
  //-----------------------------------------------------
  // 分析参数: 片段标题
  //-----------------------------------------------------
  let getSectionTitle: (key: string) => string;
  if (!props.sectionTitle) {
    getSectionTitle = (key) => _.upperCase(key);
  } else if (_.isFunction(props.sectionTitle)) {
    getSectionTitle = props.sectionTitle as (key: string) => string;
  } else {
    let _sec_titles = props.sectionTitle as Record<string, string>;
    getSectionTitle = (key) => _sec_titles[key] || _.upperCase(key);
  }
  //-----------------------------------------------------
  // 分析参数: 字段标题
  //-----------------------------------------------------
  let getItemFieldTitle =
    props.getItemFieldTitle ??
    ((
      _sectionKey: string,
      fieldKey: string,
      _item: ConflictItemValue
    ): string => {
      return fieldKey;
    });

  //-----------------------------------------------------
  // 准备展示数据
  //-----------------------------------------------------
  const DisplayItems = computed(() => {
    let re: WnConflictSectionInfo[] = [];
    _.forEach(props.value, (citems, key) => {
      let items: WnConflictItemInfo[] = [];
      for (let cit of citems) {
        let itinfo = __to_item_info(key, cit);
        items.push(itinfo);
      }
      let section: WnConflictSectionInfo = {
        name: key,
        title: getSectionTitle(key),
        items,
      };
      re.push(section);
    });
    return re;
  });
  //-----------------------------------------------------
  function __to_item_info(
    sectionKey: string,
    item: ConflictItem
  ): WnConflictItemInfo {
    let itemId = item.id as string;
    return {
      id: itemId,
      text: item.text,
      href: item.href,
      myDiffType: item.myDiffType,
      taDiffType: item.taDiffType,
      fields: _.map(item.fields, (v, k) => {
        return __to_field_info(sectionKey, k, v);
      }),
    };
  }
  //-----------------------------------------------------
  function __to_field_info(
    sectionKey: string,
    fldKey: string,
    cval: ConflictItemValue
  ): WnConflictFieldInfo {
    return {
      name: fldKey,
      title: getItemFieldTitle(sectionKey, fldKey, cval),
      myValue: cval.myValue,
      taValue: cval.taValue,
    };
  }
  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const isEmpty = computed(() => DisplayItems.value.length == 0);
  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    DisplayItems,
    isEmpty,
  };
}
