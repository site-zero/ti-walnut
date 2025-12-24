<script lang="ts" setup>
  import {
  Icons,
  ImageProps,
  ThumbProps,
  TiWall,
  toAspectGap,
  toAspectIconSize,
  toAspectRadius,
  WallProps,
} from "@site0/tijs";
import _ from "lodash";
import { computed } from "vue";
import { getWnObjIcon, Walnut } from "../../../../core";
import { WnObjWallEmitter, WnObjWallProps } from "./wn-obj-wall-types";
  //-----------------------------------------------------
  const emit = defineEmits<WnObjWallEmitter>();
  const props = withDefaults(defineProps<WnObjWallProps>(), {
    canSelect: true,
    showChecker: true,
    multi: true,
    layoutHint: "<120>",
  });
  //-----------------------------------------------------
  const WallConfig = computed(() => {
    let re: Partial<WallProps> = {
      wallItem: ({ item }) => {
        let preview: ImageProps = { height: "120px" };
        // 有缩略图
        if (item.thumb && item.id) {
          preview.src = Walnut.getUrlForObjContent(item.id, {
            withTicket: true,
            download: "auto",
          });
          preview.style = _.assign(
            {
              padding: toAspectGap(props.thumbImageWrapperPadding ?? "m"),
            },
            props.thumbImageWrapperStyle
          );
          preview.imgStyle = _.assign(
            {
              borderRadius: toAspectRadius(props.thumbImageRadius ?? "m"),
              objectFit: props.thumbImageObjFit ?? "cover",
            },
            props.thumbImageEleStyle
          );
        }
        // 就用图标
        else {
          let iconInput = getWnObjIcon(item);
          let iconObj = Icons.toIconObj(iconInput);
          preview.src = _.assign(iconObj, {
            style: _.assign(
              { fontSize: toAspectIconSize(props.thumbFontSize ?? "m") },
              props.thumbFontStyle
            ),
          });
        }

        return {
          comType: "TiThumb",
          comConf: {
            preview,
            text: item.title || item.nm,
          } as ThumbProps,
        };
      },
    };
    _.assign(re, _.omit(props, "data"));
    return re;
  });
  //-----------------------------------------------------
</script>
<template>
  <TiWall v-bind="WallConfig" :data="props.data" />
</template>
