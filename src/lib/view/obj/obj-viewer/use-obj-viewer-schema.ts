import { BlockSchema, LayoutSchema, RoadblockProps } from '@site0/tijs';
import { WnObjMetaProps, WnObjPreviewProps } from '../../..';
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
  else {
    content = {
      comType: 'TiRoadblock',
      comConf: {
        className: 'is-track',
        icon: 'fas-folder-open',
        text: '这是一个目录，因此没有内容',
      } as RoadblockProps,
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
