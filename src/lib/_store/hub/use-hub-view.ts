import { ref } from 'vue';
import { HubViewOptions, HubViewState } from './hub-view-types';

export function useWnHub(options: HubViewOptions) {
  const _state: HubViewState = {
    createContext: () => ({}),
    actions: ref({}),
    layout: ref({
      desktop: {},
      pad: {},
      phone: {},
    }),
    schema: ref({}),
    methods: {}
  };
}
