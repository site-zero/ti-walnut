import {
  ComRef,
  Icons,
  ImageProps,
  ThumbProps,
  toAspectGap,
  toAspectIconSize,
  toAspectRadius,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { getWnObjIcon, Walnut } from "../../../../core";
import { WnObjWallProps } from "./wn-obj-wall-types";

export type ObjWallApi = ReturnType<typeof useObjWallApi>;

export function useObjWallApi(props: WnObjWallProps) {
  function getWallItem(itemContext: Vars): Required<ComRef> {
    let item = itemContext.item;
    //console.log(item);
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
  }

  return {
    getWallItem,
  };
}
