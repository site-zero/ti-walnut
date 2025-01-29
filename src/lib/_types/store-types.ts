export type DataStoreActionStatus = 'loading' | 'saving';

export type DataStoreLoadStatus = 'unloaded' | 'partial' | 'full';

export type RefreshOptions = {
  reset?: boolean;
};
