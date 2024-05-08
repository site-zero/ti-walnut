import { reactive } from 'vue';

export type GlobalStatus = {
  appPath?: string;
  appLoading: boolean | string;
  loading: boolean | string;
  saving: boolean | string;
  removing: boolean | string;
  processing: boolean | string;
  changed: boolean;
  exposeHidden: boolean;
};

const _G_status_map = new Map<string, GlobalStatus>();

export function useGlobalStatus(name: string = '_APP') {
  let re = _G_status_map.get(name);
  if (!re) {
    re = reactive({
      appPath: undefined,
      appLoading: false,
      loading: false,
      saving: false,
      removing: false,
      processing: false,
      changed: false,
    } as GlobalStatus);
    _G_status_map.set(name, re);
  }
  return re;
}
