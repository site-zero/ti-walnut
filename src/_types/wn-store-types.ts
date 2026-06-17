import { ConflictItem, DiffItem, SideBarItem, Vars } from "@site0/tijs";

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

export type WnExecOptions = {
  input?: string;
  as?: "json" | "text";
  signal?: AbortSignal;

  /**
   * 开启这个选项，将不采用 fetch 接口向服务器发起数据，
   * 而是采用 `navigator.sendBeacon()` 发送。
   * 通常在页面关闭的 `unload` 或者 `beforeunload` 时想执行
   * 一个命令，需要开启这个选项，以便确保请求能到达服务器
   */
  beacon?: boolean;
  /**
   * 明确指定为 `false` 遇到 abort 到值的运行异常则会抛出
   */
  bearAbort?: boolean;
  /**
   * 发送这个分隔符，服务器会在后面吧 Session 的环境变量
   * 更新一份出来，这样一个请求即完成了命令也更新了环境变量
   */
  mos?: string;
  /**
   * 命令输出的时候，服务器是否应该尽量强制输出缓冲里的信息
   * 以便让客户端尽快得到内容。
   * 如果我们运行一个长耗时的命令，这个选项或许是调用者期望的
   */
  forceFlushBuffer?: boolean;

  /**
   * 本次请求默认关闭日志
   */
  logOff?: boolean;
};

export type WnLoadOptions = {
  signal?: AbortSignal;
  /**
   * 默认 false, 如果 true 表示即使加载不到资源
   * 也不要抛错，尽量容忍
   */
  quiet?: boolean;

  /**
   * 是否开启缓存 默认 false
   * 如果是 true, 那么会使用全局缓存
   * 如果是 Map<string, any> 那么会使用这个 Map 作为缓存
   */
  cache?: boolean | Map<string, any>;

  /**
   * 路径上带的 Query String
   */
  query?: Vars;
};

export type WnFetchObjOptions = WnLoadOptions & {
  loadAxis?: boolean;
  loadPath?: boolean;
};

export type UserSidebar = {
  statusStoreKey?: string;
  sidebar: SideBarItem[];
};

// export type StoreStatus = {
//   loading: boolean;
//   saving: boolean;
//   removing: boolean;
//   processing: boolean;
//   changed: boolean;
// };

export type WnMetaSaving = {
  update: (meta: Vars) => Promise<Vars | undefined>;
  create: (meta: Vars) => Promise<Vars | undefined>;
};
