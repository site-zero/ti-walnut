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
  // 准备展示数据
  //-----------------------------------------------------
  const DisplayItems = computed(() => {
    let re: WnConflictSectionInfo[] = [];
    _.forEach(props.value, (citems, key) => {
      let items: WnConflictItemInfo[] = [];
      for (let cit of citems) {
        let itinfo = __to_item_info(cit);
        items.push(itinfo);
      }
      let section: WnConflictSectionInfo = {
        name: key,
        title: key,
        items,
      };
      re.push(section);
    });
    return re;
  });
  //-----------------------------------------------------
  function __to_item_info(item: ConflictItem): WnConflictItemInfo {
    let itemId = item.id as string;
    return {
      id: itemId,
      title: itemId,
      myDiffType: item.myDiffType,
      taDiffType: item.taDiffType,
      fields: _.map(item.fields, (v, k) => {
        return __to_field_info(k, v);
      }),
    };
  }
  //-----------------------------------------------------
  function __to_field_info(
    key: string,
    cval: ConflictItemValue
  ): WnConflictFieldInfo {
    return {
      name: key,
      title: key,
      myValue: cval.myValue,
      taValue: cval.taValue,
    };
  }
  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    DisplayItems,
  };
}
