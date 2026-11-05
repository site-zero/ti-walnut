import { TableRowID } from "@site0/tijs";
import _ from "lodash";
import { computed } from "vue";
import { getWnObjIcon } from "../../../core";
import { WnObj } from "../../../_types";
import {
  WnObjCrumbEmitter,
  WnObjCrumbItem,
  WnObjCrumbProps,
} from "./wn-obj-crumb-types";

export type WnObjCrumbApi = ReturnType<typeof useWnObjCrumbApi>;

export type WnObjCrumbApiSetup = {
  emit: WnObjCrumbEmitter;
};

/**
 * 将 WnObj 转换为面包屑项，字段与 TiCrumb 的默认取值规则兼容
 * （value/id、icon、text），构建结果可直接作为 TiCrumb 的 data 传入
 */
function buildCrumbItem(obj: WnObj): WnObjCrumbItem {
  return {
    value: obj.id,
    icon: getWnObjIcon(obj, "fas-cube"),
    text: obj.title || obj.nm || obj.id,
  };
}

export function useWnObjCrumbApi(
  props: WnObjCrumbProps,
  setup: WnObjCrumbApiSetup
) {
  const { emit } = setup;
  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const CrumbItems = computed((): WnObjCrumbItem[] => {
    return (props.data || []).map(buildCrumbItem);
  });
  //-----------------------------------------------------
  // 事件响应
  //-----------------------------------------------------
  function onCrumbChange(id: TableRowID) {
    let obj = _.find(props.data || [], (it) => it.id == id);
    if (obj) {
      emit("change", obj);
    }
  }
  //-----------------------------------------------------
  // 暴露接口
  //-----------------------------------------------------
  return {
    CrumbItems,
    onCrumbChange,
  };
}
