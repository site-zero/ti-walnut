import { ConflictItem, DiffItem, Vars } from "@site0/tijs";

export type DataStoreActionStatus = "loading" | "saving" | "deleting";

export type DataStoreLoadStatus = "unloaded" | "partial" | "full";

export type RefreshOptions = {
  reset?: boolean;
};

export type MetaStoreConflicts = {
  server?: Vars | undefined;
  local?: Vars | undefined;
  remote?: Vars | undefined;
  localDiff?: DiffItem | undefined;
  remoteDiff?: DiffItem | undefined;
  conflict?: ConflictItem | undefined;
};

export type ListStoreConflicts = {
  server: Vars[];
  local?: Vars[] | undefined;
  remote?: Vars[] | undefined;
  localDiff: DiffItem[];
  remoteDiff: DiffItem[];
  conflicts: ConflictItem[];
};
