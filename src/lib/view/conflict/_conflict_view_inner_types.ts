import { DiffItemType } from "@site0/tijs";

export type WnConflictSectionInfo = {
  name: string;
  title: string;
  items: WnConflictItemInfo[];
};

export type WnConflictItemInfo = {
  id: string;
  text: string;
  href?: string;
  myDiffType: DiffItemType;
  taDiffType: DiffItemType;
  fields: WnConflictFieldInfo[];
};

export type WnConflictFieldInfo = {
  name: string;
  title: string;
  myValue: any;
  taValue: any;
};
