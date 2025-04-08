import { HubModel, HubModelCreateSetup } from '../hub-view-types';

export function createEmptyHubModel(_setup: HubModelCreateSetup): HubModel {
  return {
    modelType: 'EMPTY',
    store: null,
    createGUIContext: () => ({}),
    getActionBarVars: () => ({}),
    reload: async () => {},
    refresh: async () => {},
  };
}
