import {
  BlockSchema,
  I18n,
  LayoutSchema,
  RoadblockProps,
  Util,
} from '@site0/tijs';
import _ from 'lodash';
import { WnObjMetaProps, WnObjPreviewProps } from '../../..';
import { getWnObjIcon } from '../../../../core';
import { WnObjViewerApi } from './use-wn-obj-viewer';
import { WnObjViewerProps } from './wn-obj-viewer-types';

export function useObjViewerSchema(
  props: WnObjViewerProps,
  api: WnObjViewerApi
): LayoutSchema {
  //----------------------------------------------------
  // 定义布局块
  //----------------------------------------------------
  let _blocks: Record<string, BlockSchema> = {};
  //----------------------------------------------------
  // 默认元数据
  //----------------------------------------------------
  _blocks.meta = {
    comType: 'WnObjMeta',
    comConf: {
      value: props.meta,
      fields: props.fields,
      formConf: props.metaFormConf,
    } as WnObjMetaProps,
    events: {
      //change: ({ data }) => api.onMetaChange(data),
      change: 'meta:change',
    },
  };
  //----------------------------------------------------
  // 默认预览
  //----------------------------------------------------
  _blocks.preview = {
    comType: 'WnObjPreview',
    comConf: {
      value: props.meta,
    } as WnObjPreviewProps,
  };
  //----------------------------------------------------
  // 默认内容
  //----------------------------------------------------
  if (api.canEditContent()) {
    _blocks.content = {
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
    _blocks.content = {
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
    _blocks.content = {
      comType: 'TiRoadblock',
      comConf: props.emptyRoadblock,
    };
  }
  //----------------------------------------------------
  // 加入自定义的布局块
  //----------------------------------------------------
  if (props.blocks) {
    for (let key of _.keys(props.blocks)) {
      let { comType, comConf, events } = props.blocks[key];
      _blocks[key] = { comType, comConf, events };
    }
  }
  //----------------------------------------------------
  // 处理动态块
  //----------------------------------------------------
  if (props.dynamicBlocks) {
    let ctx = {
      meta: props.meta,
      content: props.content,
      ContentData: api.getContentData(),
    };
    for (let key of props.dynamicBlocks) {
      let block = _blocks[key];
      if (block) {
        _blocks[key] = Util.explainObj(ctx, block) as BlockSchema;
      }
    }
  }

  //----------------------------------------------------
  // 返回界面块设置
  //----------------------------------------------------
  return _blocks;
}
