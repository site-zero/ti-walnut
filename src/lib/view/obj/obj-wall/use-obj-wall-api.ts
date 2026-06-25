import {
  getWnObjIcon,
  toWnObj,
  toWnObjs,
  Walnut,
  WnObj,
} from "@site0/ti-walnut";
import {
  ComRef,
  Icons,
  ImageProps,
  ThumbProps,
  toAspectGap,
  toAspectIconSize,
  toAspectRadius,
  Vars,
  WallItem,
  WallSelectEmitInfo,
} from "@site0/tijs";
import _ from "lodash";
import {
  WnObjWallEmitter,
  WnObjWallProps,
  WnObjWallSelectEmitInfo,
} from "./wn-obj-wall-types";

export type ObjWallApi = ReturnType<typeof useObjWallApi>;

export function useObjWallApi(props: WnObjWallProps, emit: WnObjWallEmitter) {
  function getWallItem(itemContext: Vars): Required<ComRef> {
    let item = itemContext.item;
    //console.log(item);
    let preview: ImageProps = _.assign(
      { height: "120px", style: {} },
      props.preview
    );
    // 有缩略图
    if (item.thumb && item.id) {
      // .............. | preview:src | .............
      preview.src = Walnut.getUrlForObjContent(item.id, {
        withTicket: true,
        download: "auto",
      });
      // .............. | preview:style | .............
      if (!preview.style?.padding) {
        preview.style!.padding = toAspectGap(
          props.previewImageWrapperPadding ?? "m"
        );
      }
      _.assign(preview.style, props.previewImageWrapperStyle);
      // .............. | preview:imgStyle | .............
      if (!preview.imgStyle) {
        preview.imgStyle = _.assign(
          {
            borderRadius: toAspectRadius(props.previewImageRadius ?? "m"),
            objectFit: props.previewImageObjFit ?? "cover",
          },
          props.previewImageEleStyle
        );
      }
    }
    // 就用图标
    else {
      let iconInput = getWnObjIcon(item);
      let iconObj = Icons.toIconObj(iconInput);
      // .............. | preview:src | .............
      preview.src = _.assign(iconObj, {
        style: _.assign(
          { fontSize: toAspectIconSize(props.previewFontSize ?? "m") },
          props.previewFontStyle
        ),
      });
    }

    return {
      comType: "TiThumb",
      comConf: _.assign({}, props.thumbAspect, {
        preview,
        text: item.title || item.nm,
      } as ThumbProps),
    };
  }

  function onSelect(payload: WallSelectEmitInfo) {
    let pld: WnObjWallSelectEmitInfo = {
      currentId: payload.currentId as string,
      checkedIds: payload.checkedIds as string[],
      current: payload.current ? toWnObj(payload.current) : undefined,
      checked: toWnObjs(payload.checked || []),
      index: payload.index,
      oldCurrentId: payload.oldCurrentId as string,
      oldCheckedIds: payload.oldCheckedIds as Map<string, boolean>,
    };
    emit("select", pld);
  }

  function onOpen(item: WallItem) {
    let obj = item.rawData as WnObj;
    emit("open", {
      id: item.id as string,
      index: item.index,
      obj,
    });
  }

  return {
    getWallItem,
    onSelect,
    onOpen,
  };
}
