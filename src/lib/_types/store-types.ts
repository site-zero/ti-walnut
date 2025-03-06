export type DataStoreActionStatus = 'loading' | 'saving' | 'deleting';

export type DataStoreLoadStatus = 'unloaded' | 'partial' | 'full';

export type RefreshOptions = {
  reset?: boolean;
};
