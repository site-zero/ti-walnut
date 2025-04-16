import { BlockSchema, I18n, LayoutSchema, RoadblockProps } from '@site0/tijs';
import { WnObjMetaProps, WnObjPreviewProps } from '../../..';
import { getWnObjIcon } from '../../../../core';
import { WnObjViewerApi } from './use-wn-obj-viewer';
import { WnObjViewerProps } from './wn-obj-viewer-types';

export function useObjViewerSchema(
  props: WnObjViewerProps,
  api: WnObjViewerApi
): LayoutSchema {
  let content: BlockSchema;

  // 可编辑文本，就用代码编辑器
  if (api.canEditContent()) {
    content = {
      comType: 'TiCodeEditor',
      comConf: {
        type: props.meta?.tp,
        mime: props.meta?.mime,
        value: props.content,
      },
      events: {
        change: ({ data }) => api.onContentChange(data),
      },
    };
  }
  // 否则显示一个路障牌
  else if (props.meta) {
    let key_type = api.isDIR() ? 'folder' : 'file';
    let text = I18n.getf(
      `wn-obj-viewer-can-not-edit-${key_type}`,
      props.meta ?? {}
    );
    let icon = getWnObjIcon(props.meta ?? {});
    content = {
      comType: 'TiRoadblock',
      comConf: {
        icon,
        text,
        className: 'is-primary-r',
        size: 'normal',
        iconStyle: { fontSize: '6em', height: 'unset', width: 'unset' },
        textStyle: {
          padding: '1em 4em',
          maxWidth: '480px',
        },
      } as RoadblockProps,
    };
  }
  // 显示空白占位
  else {
    content = {
      comType: 'TiRoadblock',
      comConf: props.emptyRoadblock,
    };
  }

  //----------------------------------------------------
  // 返回界面块设置
  //----------------------------------------------------
  return {
    meta: {
      comType: 'WnObjMeta',
      comConf: {
        value: props.meta,
        fields: props.fields,
      } as WnObjMetaProps,
      events: {
        change: ({ data }) => api.onMetaChange(data),
      },
    },
    content,
    preview: {
      comType: 'WnObjPreview',
      comConf: {
        value: props.meta,
      } as WnObjPreviewProps,
    },
  };
}
