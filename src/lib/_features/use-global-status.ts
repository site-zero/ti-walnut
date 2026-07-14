import {
  ButtonProps,
  ProcessProps,
  TableSelectEmitInfo,
  Util,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { computed, ref } from "vue";

const debug = false;

// /**
//  * 描述了一个应用路径的解析后信息。
//  *
//  * 例如：/a/b/c/d 解析后的信息如下：
//  */
// export type AppPathInfo = {
//   /**
//    * 路径的深度，例如：`/a/b/c/d` 的深度为 4
//    */
//   depth: number;

//   /**
//    * 路径的基础部分，例如：`/a/b/c/d` 的基础部分为 `/a/b/c`
//    */
//   base?: string;

//   /**
//    * 路径的最后一部分，例如：`/a/b/c/d` 的最后一部分为 `d`
//    */
//   entryName?: string;

//   /**
//    * 路径的最顶层目录名，例如：`/a/b/c/d` 的最顶层目录为 `a`
//    */
//   top?: string;

//   /**
//    * 路径的除去最顶层目录后剩余部分，例如：`/a/b/c/d` 的剩余部分为 `/b/c/d`
//    */
//   remain?: string;
// };

export type GlobalStatus = {
  //..........................................
  // 应用整体状态
  appLogo?: string;
  signupMainLogo?: string;
  appTitle?: string;
  appVersion?: string;
  appName?: string;
  appBase?: string;
  appPath?: string;
  appLoading: boolean | string;
  quitPath?: string;
  viewName?: string;
  serverBase?: string;
  configName?: string;

  //..........................................
  // 关键信息
  domain?: string;
  loginSite?: string;

  /**
   * 默认为 true， false 表示隐藏侧边栏
   */
  appSidebar?: boolean;
  loading: boolean | string;
  saving: boolean | string;
  removing: boolean | string;
  changed: boolean;
  exposeHidden: boolean;
  processing: boolean | string;
  //..........................................
  /**
   * 表示一个全局唯一的长时工作的进度
   * 应该全局展示一个遮罩面板
   */
  process: ProcessProps | null | undefined;
  //..........................................
  // 全局列表选定状态等
  selectedRows?: number;
  selectedCols?: number;
  currentObj?: Vars;
};

export type GlobalStatusApi = ReturnType<typeof defineGlobalStatus>;

function defineGlobalStatus() {
  let _data = ref({
    serverBase: "/",
    configName: "server.config.json",
  } as GlobalStatus);
  resetData();

  const Data = computed(() => _data.value);

  function resetData() {
    if (debug) console.log("resetData");
    _.assign(_data.value, {
      appLoading: false,
      loading: false,
      saving: false,
      removing: false,
      changed: false,
      exposeHidden: false,

      // 全局执行状态
      processing: false,
      process: undefined,
    });
  }

  function setData(delta: Partial<GlobalStatus>) {
    if (debug) console.log("setData", { ...delta });
    _.assign(_data.value, delta);
  }

  function setProcessing(processing: string | boolean) {
    _data.value.processing = processing;
  }

  function updateProcess(process: Partial<ProcessProps>) {
    if (_data.value.process) {
      _.assign(_data.value.process, process);
    }
  }

  function setProcessProgress(p: number) {
    if (_data.value.process && _data.value.process.progress) {
      _data.value.process.progress.value = p;
    }
  }

  function setProcessAbort(abort: string | ButtonProps | undefined) {
    if (_data.value.process) {
      _data.value.process.abort = abort;
    }
  }

  function pushProcessLog(msg: string) {
    if (_data.value.process) {
      if (_data.value.process.logs) {
        _data.value.process.logs.push(msg);
      } else {
        _data.value.process.logs = [msg];
      }
    }
  }

  // /**
  //  * 解析应用路径，提取路径信息
  //  *
  //  * @returns 路径信息对象
  //  */
  // function parseAppPath(): AppPathInfo {
  //   if (!_data.appPath) {
  //     return { depth: 0 };
  //   }
  //   // Split the path by '/' and remove empty segments
  //   const parts = _data.appPath.split("/").filter(Boolean);
  //   const depth = parts.length;

  //   // Handle root path case (when path is '/' or '')
  //   if (depth === 0) {
  //     return { depth: 0 };
  //   }

  //   // Extract components
  //   const entryName = parts[depth - 1]; // Last segment
  //   const base = depth === 1 ? "/" : "/" + parts.slice(0, depth - 1).join("/"); // All but last segment
  //   const top = parts[0]; // First segment
  //   const remain = depth === 1 ? "" : "/" + parts.slice(1).join("/"); // All after first segment

  //   // Return the complete AppPathInfo object
  //   return {
  //     depth,
  //     base,
  //     entryName,
  //     top,
  //     remain,
  //   };
  // }

  function setAppPath(hubPath: string) {
    // 确保 hubPath(`http://xxxx/{appBase}/{hubPath}`) 是以 `/` 开头的
    // 这样比较容易和 appBase 进行比较
    // 在开发环境下，通常 appBase = '/'
    // 在发布环境下，通常 appBase = '/a/load/wn.hub'
    if (!hubPath.startsWith("/")) {
      hubPath = "/" + hubPath;
    }

    // 去掉 appBase
    let { appBase = "/" } = _data.value;
    if (!appBase.endsWith("/")) {
      appBase += "/";
    }
    // 譬如
    // appBase = '/a/open/wn.hub/'
    // hubPath = '/a/load/wn.hub/files/a.mp4'
    // 那么 appPath='files/a.mp4'
    if (hubPath.startsWith(appBase)) {
      hubPath = hubPath.substring(appBase.length);
    }
    // 另外的情况
    // appBase = '/a/open/wn.hub/'
    // hubPath = '/a/load/wn.hub'
    // 那么 appPath=''
    else if (hubPath + "/" == appBase) {
      hubPath = "";
    }

    _data.value.appPath = hubPath;
  }

  function getPathOfApp(path: string) {
    let base = _data.value.appBase ?? "/";
    if (!path.startsWith(base)) {
      path = Util.appendPath(base, path);
    }
    return path;
  }

  function onListSelect(selection: TableSelectEmitInfo) {
    let { checkedIds, current } = selection;
    let delta: Partial<GlobalStatus> = {};
    delta.selectedCols = 0;
    delta.currentObj = current ?? undefined;
    if (checkedIds) {
      delta.selectedRows = checkedIds.length ?? 0;
    } else {
      delta.selectedRows = 0;
    }
    setData(delta);
  }

  // watch(
  //   () => _data.selectedRows,
  //   (newVal, oldVal) => {
  //     console.warn("selectedRows changed", newVal, oldVal);
  //   }
  // );

  return {
    _data,
    Data,
    //parseAppPath,
    getPathOfApp,
    setAppPath,
    resetData,
    setData,
    setProcessing,
    updateProcess,
    setProcessProgress,
    setProcessAbort,
    pushProcessLog,
    onListSelect,
  };
}

let __G: GlobalStatusApi | undefined = undefined;

type GlobalStatusApiSetup = {
  autoReset?: boolean;
};

export function useGlobalStatus(setup: GlobalStatusApiSetup = {}) {
  let { autoReset = true } = setup;
  if (!__G) {
    __G = defineGlobalStatus();
  } else if (autoReset) {
    __G.resetData();
  }
  return __G;
}

export function getGlobalStatus() {
  return useGlobalStatus({ autoReset: false });
}
