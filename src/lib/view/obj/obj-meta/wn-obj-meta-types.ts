import { FieldRefer, RoadblockProps, Vars } from '@site0/tijs';

export type WnObjMetaProps = {
  value?: Vars;
  /**
   * 空白数据，显示的样式
   */
  emptyRoadblock?: RoadblockProps;

  // 指定字段
  fields?: FieldRefer[];
};
