import { CommonProps, ConflictItem, ConflictItemValue } from "@site0/tijs";

// export type WnConflictViewEmitter = {
//   (event: "change", payload: any): void;
// };

export type WnConflictViewProps = CommonProps & {
  /**
   * 这是一个冲突表
   */
  value?: Record<string, ConflictItem[]>;

  /**
   * 将冲突表的键，翻译为便于显示的章节标题，
   * 如果未定义则采用 key 本身
   */
  sectionTitle?: Record<string, string> | ((key: string) => string);

  /**
   * 如何获取冲突项的字段标题，如果未定义则采用字段的键
   *
   * @param key 冲突表的键
   * @param fieldKey 字段的键
   * @param item 冲突项
   */
  getItemFieldTitle?: (
    key: string,
    fieldKey: string,
    item: ConflictItemValue
  ) => string;
};
