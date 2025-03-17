import { HubModel } from '../hub-view-types';

export function createEmptyHubModel(): HubModel {
  return {
    modelType: 'EMPTY',
    store: null,
    createGUIContext: () => ({}),
    getActionBarVars: () => ({}),
    reload: async () => {},
    refresh: async () => {},
  };
}
