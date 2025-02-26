import { LayoutSchema, RoadblockProps } from '@site0/tijs';
import { WnObjViewerApi } from './use-wn-obj-viewer';
import { WnObjViewerProps } from './wn-obj-viewer-types';

export function useObjViewerSchema(
  props: WnObjViewerProps,
  api: WnObjViewerApi
): LayoutSchema {
  return {
    meta: {
      comType: 'TiForm',
      comConf: {
        className: 'cover-parent',
        emptyRoadblock: {
          icon: 'fas-arrow-left',
          text: 'i18n:nil-detail',
        },
        maxFieldNameWidth: 80,
        layoutHint: '<300>',
        bodyPartGap: 'b',
        fields: [
          '###=/基本信息',
          'obj.nm',
          'obj.title',
          //'obj.pid',
          'obj.race',
          ['###=/文件信息', { visible: { race: 'FILE' } }],
          'obj.tp',
          'obj.mime',
          'obj.len',
          'obj.sha1',
          '###=/时间戳',
          'obj.ct',
          'obj.lm',
          'obj.expi',
          '###=/权限信息',
          'obj.id',
          'obj.d0',
          'obj.d1',
          'obj.c',
          'obj.m',
          'obj.g',
          'obj.md',
        ],
        data: props.meta,
      },
      events: {
        change: ({ data }) => api.onMetaChange(data),
      },
    },
    content: api.isFILE()
      ? {
          comType: 'TiCodeEditor',
          comConf: {
            type: props.meta?.tp,
            mime: props.meta?.mime,
            value: props.content,
          },
          events: {
            change: ({ data }) => api.onContentChange(data),
          },
        }
      : {
          comType: 'TiRoadblock',
          comConf: {
            className: 'is-track',
            icon: 'fas-folder-open',
            text: '这是一个目录，无法查看文本内容',
          } as RoadblockProps,
        },
  };
}
