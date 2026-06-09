import {
  QueryFilter,
  QuerySorter,
  SqlExecAction,
  SqlPagerInput,
  SqlResult,
  useGlobalStatus,
  useRdsListStore,
  Walnut,
} from "@site0/ti-walnut";
import {
  DataValidation,
  FieldStatus,
  KeepInfo,
  TableSelectEmitInfo,
  useValidateResults,
  V,
  ValidateOptions,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { computed } from "vue";
import {
  WnObjMultiUploadTailProps,
  WnObjMultiUploadTailEmitter,
} from "./wn-omup-types";

export type WnObjMultiUploadTailApi = ReturnType<
  typeof useWnObjMultiUploadTailApi
>;
export type WnObjMultiUploadTailSetup = {
  emit: WnObjMultiUploadTailEmitter;
  getValidation?: () => DataValidation | undefined;
};

export function useWnObjMultiUploadTailApi(
  _props: WnObjMultiUploadTailProps,
  setup: WnObjMultiUploadTailSetup
) {
  //-----------------------------------------------------
  // 数据模型
  //-----------------------------------------------------
  const _gb_sta = useGlobalStatus();
  //-----------------------------------------------------
  const _vali = useValidateResults({
    getValidation: () => V(setup.getValidation),
    getId: (item: Vars) => item.id,
  });
  //-----------------------------------------------------

  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------

  //-----------------------------------------------------
  // 操作函数
  //-----------------------------------------------------

  //-----------------------------------------------------
  // 数据改动
  //-----------------------------------------------------

  //-----------------------------------------------------
  // 远程操作
  //-----------------------------------------------------

  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    // 计算属性
    // 操作函数
    // 数据改动
    // 远程操作
  };
}
