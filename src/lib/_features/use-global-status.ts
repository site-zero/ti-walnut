import { ProcessProps } from '@site0/tijs';
import { reactive } from 'vue';

export type GlobalStatus = {
  appPath?: string;
  appLoading: boolean | string;
  loading: boolean | string;
  saving: boolean | string;
  removing: boolean | string;
  changed: boolean;
  exposeHidden: boolean;
  processing: boolean | string;
  /**
   * 表示一个全局唯一的长时工作的进度
   * 应该全局展示一个遮罩面板
   */
  process: ProcessProps | null | undefined;
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
      changed: false,
      exposeHidden: false,
      processing: false,
      // process: {
      //   title: {
      //     //prefixIcon: 'fas-chalkboard-user',
      //     text: 'I have some work to do',
      //   },
      //   progress: {
      //     value: 0.4,
      //   },
      //   logs: [
      //     '2023-10-01: Initialized',
      //     '2023-10-02: Loading resources',
      //     '2023-10-03: Resources loaded',
      //     '2023-10-04: Processing data',
      //     '2023-10-05: Data processed',
      //     '2023-10-06: Saving results',
      //     '2023-10-07: Results saved',
      //     '2023-10-08: Completed',
      //   ],
      // },
    } as GlobalStatus);
    _G_status_map.set(name, re);
  }
  return re;
}
