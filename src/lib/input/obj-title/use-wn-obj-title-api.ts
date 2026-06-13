import { Be } from "@site0/tijs";
import _ from "lodash";
import { computed, ref } from "vue";
import { getWnObjIcon } from "../../../core";
import { WnObjTitleEmitter, WnObjTitleProps } from "./wn-obj-title-types";

export type WnObjTitleApi = ReturnType<typeof useWnObjTitleApi>;

export type WnObjTitleSetup = {
  emit: WnObjTitleEmitter;
  getTextElement: () => HTMLElement | null;
};

export function useWnObjTitleApi(
  props: WnObjTitleProps,
  setup: WnObjTitleSetup
) {
  const { emit, getTextElement } = setup;
  const _editing = ref(false);
  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const TitleText = computed(() => {
    return props.value || props.meta?.title || props.meta?.nm || "";
  });
  //-----------------------------------------------------
  const hasValue = computed(() => (props.value ? true : false));
  const isEditing = computed(() => _editing.value);
  //-----------------------------------------------------
  const ObjIcon = computed(() => {
    return getWnObjIcon(props.meta, "fas-file");
  });
  //-----------------------------------------------------
  // 数据改动
  //-----------------------------------------------------
  async function onEdit() {
    let $el = getTextElement();
    if (!$el) return;
    _editing.value = true;
    let new_title = await Be.EditIt($el);
    console.log("new_title", new_title);
    _editing.value = false;
    if (!_.isNil(new_title)) {
      emit("change", new_title || null);
    }
  }
  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    // 计算属性
    TitleText,
    hasValue,
    ObjIcon,
    isEditing,
    // 数据改动
    onEdit,
  };
}
