import { RoadblockProps } from '@site0/tijs';
import { WnObj } from '../../../_types';

export type WnObjPreviewProps = {
  value?: WnObj;
  /**
   * 空白数据，显示的样式
   */
  emptyRoadblock?: RoadblockProps;
};

export type WnObjPreivewInfo = {
  /**
   * 预览内容的不同分类，模板会根据它用不同的方式展示内容
   */
  type:
    | 'none'
    | 'folder'
    | 'text'
    | 'json'
    | 'html'
    | 'markdown'
    | 'image'
    | 'audio'
    | 'video'
    | 'binary';
  /**
   * 如果是 text/json 类型，就是一个加载文本的命令 `cat id:xxx`
   * 如果是 html/audio/video/image 类型，则显示内容链接
   * 如果是 binary 类型，则显示下载链接
   */
  src: string;
};
