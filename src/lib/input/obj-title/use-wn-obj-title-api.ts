import { Alg, Be, TipsApi, Vars } from "@site0/tijs";
import JSON5 from "json5";
import _ from "lodash";
import { computed, ref } from "vue";
import { getWnObjIcon } from "../../../core";
import { WnObjTitleEmitter, WnObjTitleProps } from "./wn-obj-title-types";
import { gen_wn_obj_title_tip_html } from "./support";

export type WnObjTitleApi = ReturnType<typeof useWnObjTitleApi>;

export type WnObjTitleSetup = {
  emit: WnObjTitleEmitter;
  getTextElement: () => HTMLElement | null;
  getTipsApi: () => TipsApi | undefined;
};

export function useWnObjTitleApi(
  props: WnObjTitleProps,
  setup: WnObjTitleSetup
) {
  const { emit, getTextElement, getTipsApi } = setup;
  const _editing = ref(false);
  let _tip_id = ref(0);
  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const TitleText = computed(() => {
    return props.value || props.meta?.title || props.meta?.nm || "";
  });
  //-----------------------------------------------------
  const TitleTip = computed(() => {
    if (_tip_id.value > 0) {
      return `::${_tip_id.value}`;
    }
  });
  //-----------------------------------------------------
  const hasValue = computed(() => (props.value ? true : false));
  const isEditing = computed(() => _editing.value);
  //-----------------------------------------------------
  const ObjIcon = computed(() => {
    return getWnObjIcon(props.meta, "fas-file");
  });
  //-----------------------------------------------------
  // 提示信息相关操作
  //-----------------------------------------------------
  function deposeTip() {
    const $tips = getTipsApi();
    if ($tips) {
      $tips.removeTip(_tip_id.value);
    }
  }
  //-----------------------------------------------------
  function registerTip() {
    const $tips = getTipsApi();
    if ($tips) {
      // 确保被取消注册
      if (_tip_id.value > 0) {
        $tips.removeTip(_tip_id.value);
      }
      // 防空
      if (!props.meta) return;

      // 生成内容
      let contentHtml = gen_wn_obj_title_tip_html(props.meta);

      // 注册自己提示信息
      _tip_id.value = $tips.addTip({
        comType: "TiHtmlSnippet",
        comConf: {
          content: contentHtml,
        },
      });
    }
  }
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
    TitleTip,
    hasValue,
    ObjIcon,
    isEditing,
    // 提示信息相关操作
    deposeTip,
    registerTip,
    // 数据改动
    onEdit,
  };
}
