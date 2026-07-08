import { getWnObjIcon } from "@site0/ti-walnut";
import { I18n } from "@site0/tijs";
import { computed } from "vue";
import { WnObjThumbProps } from "./wn-obj-thumb-types";

export type WnObjThumbApi = ReturnType<typeof useObjThumbApi>;

export function useObjThumbApi(props: WnObjThumbProps) {
  //-----------------------------------------------------
  // 计算属性
  //-----------------------------------------------------
  const ObjIcon = computed(() => {
    return getWnObjIcon(props.value);
  });
  //-----------------------------------------------------
  const ObjText = computed(() => {
    let obj = props.value ?? {};
    let re = I18n.text("i18n:nil");
    if (obj) {
      let { title, nm, tp } = obj;
      re = nm;
      if (title && nm && title != nm) {
        re = title;
        let suffix = "." + tp;
        if (tp && !title.endsWith(suffix)) {
          re = title + suffix;
        }
      }
    }
    return re;
  });
  //-----------------------------------------------------
  const PrefixIcons = computed(() => {
    if(props.getPrefixIcons && props.value){
      return props.getPrefixIcons(props.value);
    }
    return [];
  })
  //-----------------------------------------------------
  const SuffixIcons = computed(() => {
    if(props.getSuffixIcons && props.value){
      return props.getSuffixIcons(props.value);
    }
    return [];
  })
  //-----------------------------------------------------
  // 返回接口
  //-----------------------------------------------------
  return {
    ObjIcon,
    ObjText,
    PrefixIcons,
    SuffixIcons,
  };
}
