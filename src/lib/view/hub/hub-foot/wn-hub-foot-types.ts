import {
  FlexAlignment,
  IconInput,
  TipBoxProps,
  ValuePipeProps,
  Vars,
} from '@site0/tijs';

/**
 * 分组类型
 *
 * current - 每个字段都是当前对象
 * selection - 本组就是显示选择项目数量
 */
export type FootPartType = 'current' | 'selection' | 'view';

export type FootPart = {
  type?: FootPartType;
  icon?: IconInput;
  text?: string;
  suffix?: string;
  align?: FlexAlignment;
  flex?: string;
  style?: Vars;
  items?: FootPartItem[];
};

export type FootPartItemType = 'std-id' | 'text' | 'date' | 'datetime';

export type FootPartItem = ValuePipeProps & {
  icon?: IconInput;
  text?: string;
  tip?: TipBoxProps;
  suffix?: string;
  value?: string;
  style?: Vars;
};

export type WnHubFootProps = {
  align?: FlexAlignment;
  parts?: FootPart[];
};
