import { ProcessProps } from '@site0/tijs';
import { reactive } from 'vue';

export type GlobalStatus = {
  appLogo?: string;
  appTitle?: string;
  appVersion?: string;
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

/**
 * 描述了一个应用路径的解析后信息。
 *
 * 例如：/a/b/c/d 解析后的信息如下：
 */
export type AppPathInfo = {
  /**
   * 路径的深度，例如：`/a/b/c/d` 的深度为 4
   */
  depth: number;

  /**
   * 路径的基础部分，例如：`/a/b/c/d` 的基础部分为 `/a/b/c`
   */
  base?: string;

  /**
   * 路径的最后一部分，例如：`/a/b/c/d` 的最后一部分为 `d`
   */
  entryName?: string;

  /**
   * 路径的最顶层目录名，例如：`/a/b/c/d` 的最顶层目录为 `a`
   */
  top?: string;

  /**
   * 路径的除去最顶层目录后剩余部分，例如：`/a/b/c/d` 的剩余部分为 `/b/c/d`
   */
  remain?: string;
};

export type GlobalStatusApi = ReturnType<typeof defineGlobalStatus>;

function defineGlobalStatus() {
  let _data = reactive({
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

  /**
   * 解析应用路径，提取路径信息
   *
   * @returns 路径信息对象
   */
  function parseAppPath(): AppPathInfo {
    if (!_data.appPath) {
      return { depth: 0 };
    }
    // Split the path by '/' and remove empty segments
    const parts = _data.appPath.split('/').filter(Boolean);
    const depth = parts.length;

    // Handle root path case (when path is '/' or '')
    if (depth === 0) {
      return { depth: 0 };
    }

    // Extract components
    const entryName = parts[depth - 1]; // Last segment
    const base = depth === 1 ? '/' : '/' + parts.slice(0, depth - 1).join('/'); // All but last segment
    const top = parts[0]; // First segment
    const remain = depth === 1 ? '' : '/' + parts.slice(1).join('/'); // All after first segment

    // Return the complete AppPathInfo object
    return {
      depth,
      base,
      entryName,
      top,
      remain,
    };
  }

  return {
    data: _data,
    parseAppPath,
  };
}

const _G_status_instance = new Map<string, GlobalStatusApi>();

export function useGlobalStatus(name: string = '_APP') {
  let re = _G_status_instance.get(name);
  if (!re) {
    re = defineGlobalStatus();
    _G_status_instance.set(name, re);
  }
  return re;
}
