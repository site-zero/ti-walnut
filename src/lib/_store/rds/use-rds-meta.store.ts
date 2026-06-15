import {
  DataStoreActionStatus,
  DataStoreLoadStatus,
  JoinChange,
  joinSqlChanges,
  LocalMetaEditSetup,
  LocalMetaMakeChangeOptions,
  MetaStoreConflicts,
  QueryFilter,
  SqlExecAction,
  SqlExecPreError,
  SqlMakeChangeResult,
  SqlResult,
  useLocalMetaEdit,
  useSqlx,
} from "@site0/ti-walnut";
import {
  apply_conflict,
  buildConflict,
  BuildConflictItemOptions,
  buildDifferentItem,
  Match,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { computed, ref } from "vue";

const debug = false;

export type RdsMetaStoreApi = ReturnType<typeof defineRdsMetaStore>;

export type RdsMetaStoreOptions = LocalMetaEditSetup & {
  daoName?: string;
  /**
   * 如果指定了这个选项，将会生成一个 AutoMatch
   * 如果匹配了查询条件才可查询。
   * 如果不声明这个选项，则什么条件都会查询
   *
   * 它的上下文输入为整个 SqlQuery 对象
   */
  filterReady?: any;
  filter: QueryFilter | (() => QueryFilter);
  sqlFetch: string;
  makeChange?: LocalMetaMakeChangeOptions;
  refreshWhenSave?: boolean;
  patchRemote?: (remote: SqlResult) => SqlResult;
};

/**
 * 定义一个数据访问的实例
 *
 * @param options 配置参数
 * @returns 实例
 */
function defineRdsMetaStore(options: RdsMetaStoreOptions) {
  //---------------------------------------------
  // 准备数据访问模型
  let sqlx = useSqlx(options.daoName);
  //console.log('defineDataMetaStore', options);
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const _remote = ref<SqlResult>();
  const _action_status = ref<DataStoreActionStatus>();
  //const _filter = ref<QueryFilter>(options.filter);
  //---------------------------------------------
  const hasRemoteMeta = computed(() => {
    if (!_remote.value || _.isEmpty(_remote.value)) {
      return false;
    }
    return true;
  });
  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = useLocalMetaEdit(_remote, options);
  //---------------------------------------------
  const MetaData = computed(() => {
    return _local.localMeta.value || _remote.value || {};
  });
  //---------------------------------------------
  const MetaId = computed(() => MetaData.value.id);
  //---------------------------------------------
  const changed = computed(() => _local.isChanged());
  const isNew = computed(() => isNewMeta());
  //---------------------------------------------
  const ActionStatus = computed(() => _action_status.value);
  //---------------------------------------------
  const ActionBarVars = computed(() => {
    return {
      loading: _action_status.value == "loading",
      saving: _action_status.value == "saving",
      changed: changed.value,
    } as Vars;
  });
  //---------------------------------------------
  const LoadStatus = computed((): Omit<DataStoreLoadStatus, "partial"> => {
    if (hasRemoteMeta.value) {
      return "full";
    }
    return "unloaded";
  });
  //---------------------------------------------
  function reset() {
    clearRemoteMeta();
    dropChange();
  }

  function clearRemoteMeta() {
    _remote.value = undefined;
  }

  function setRemoteMeta(meta: SqlResult) {
    _remote.value = meta;
  }

  function dropChange() {
    _local.reset();
  }

  function resetLocalChange() {
    _local.reset();
  }

  function setActionStatus(st?: DataStoreActionStatus | null) {
    _action_status.value = st || undefined;
  }

  // function updateFilter(filter: QueryFilter) {
  //   _.assign(_filter.value, filter);
  // }

  // function setFilter(filter: QueryFilter) {
  //   _filter.value = filter;
  // }

  function updateMeta(meta: SqlResult) {
    _local.updateMeta(meta);
  }

  function setMeta(meta: SqlResult) {
    _local.setMeta(meta);
  }

  //---------------------------------------------
  //                 被内部重用的方法
  //---------------------------------------------
  function isNewMeta() {
    if (options.isNew) {
      return options.isNew(MetaData);
    }
    return _.isEmpty(_remote.value);
  }

  function makeChanges(): SqlMakeChangeResult {
    // 保护一下
    if (!options.makeChange) {
      if (debug) console.log("without options.makeChange");
      return { changes: [] };
    }
    // 获取改动信息
    let mcre = _local.makeChange(options.makeChange);

    if (debug) console.log("makeChanges", mcre);
    return mcre;
  }

  function joinChanges(changes: SqlExecAction[]): SqlExecPreError[] {
    let mcr = makeChanges();
    if (mcr.errors && mcr.errors.length > 0) {
      return mcr.errors;
    }
    if (mcr.changes && mcr.changes.length > 0) {
      changes.push(...mcr.changes);
    }
    return [];
  }

  function getDiffMeta() {
    return _local.getDiffMeta();
  }

  //---------------------------------------------
  // 冲突
  //---------------------------------------------
  async function makeConflict(
    options: BuildConflictItemOptions = {}
  ): Promise<MetaStoreConflicts | undefined> {
    // 首先从服务器拉取数据，然后我们就有了三个数据版本
    let server = await loadRemoteMeta();

    // 比对差异
    return createConflictBy(server, options);
  }

  function createConflictBy(
    server: SqlResult | undefined,
    options: BuildConflictItemOptions
  ): MetaStoreConflicts {
    // 首先从服务器拉取数据，然后我们就有了三个数据版本
    let local = _local.localMeta.value;
    let remote = _remote.value;

    // 比对差异
    let myDiff = buildDifferentItem(local, remote);
    let taDiff = buildDifferentItem(server, remote);

    // 算冲突
    let conflict = buildConflict(myDiff, taDiff, options);

    return {
      server,
      local,
      remote,
      localDiff: myDiff,
      remoteDiff: taDiff,
      conflict,
    };
  }

  /**
   * 解决冲突，首先将 server 数据覆盖 remote
   * 然后除了冲突的字段， local 的字段全部用 server 字段替换
   */
  function applyConflicts(cf: MetaStoreConflicts) {
    let { server, localDiff } = cf;
    _remote.value = server;
    apply_conflict(_local.localMeta, server, localDiff);
  }
  //---------------------------------------------
  //                  帮助函数
  //---------------------------------------------
  function __gen_filter(): QueryFilter {
    if (_.isFunction(options.filter)) {
      return options.filter();
    }

    // 直接采用
    return _.cloneDeep(options.filter);
  }
  //---------------------------------------------
  function _is_filter_ready(flt: QueryFilter): boolean {
    if (!flt || _.isEmpty(flt)) return false;
    if (_.isNil(options.filterReady)) return true;
    const am = Match.parse(options.filterReady);
    return am.test(flt);
  }
  //---------------------------------------------
  //                  远程操作
  //---------------------------------------------
  /**
   * 从数据库加载元数据
   * 该方法会执行 sqlFetch 查询，返回查询结果
   * 如果配置了 patchRemote，会对结果进行处理
   * @returns 加载的元数据或 undefined
   */
  async function loadRemoteMeta(): Promise<SqlResult | undefined> {
    //console.log('I am fetch remote', _filter.value);
    _action_status.value = "loading";
    try {
      let flt = __gen_filter();
      let re = await sqlx.fetch(options.sqlFetch, flt);
      // 没有过滤条件，就不查询数据
      if (!_is_filter_ready(flt)) {
        return undefined;
      }
      if (re && options.patchRemote) {
        re = options.patchRemote(re);
      }
      return re;
    } finally {
      _action_status.value = undefined;
    }
  }

  /**
   * 从远程加载元数据并更新本地存储
   * 该方法会调用 loadRemoteMeta 获取最新数据，
   * 然后将结果设置到 _remote 引用中
   */
  async function fetchRemoteMeta(): Promise<void> {
    _remote.value = await loadRemoteMeta();
  }

  /**
   * 保存当前的修改到远程服务器
   * 会先检查修改并生成变更操作，然后执行这些操作
   * 如果配置了 refreshWhenSave，保存后会刷新远程数据并重置本地修改
   */
  async function saveChange(): Promise<void> {
    // 获取改动信息
    let mcre = makeChanges();

    // 有错误的话，不要执行
    let changes: SqlExecAction[] = [];
    if (JoinChange.WithError == joinSqlChanges(changes, mcre)) {
      return;
    }

    // 保护一下
    if (changes.length == 0) {
      return;
    }

    // 最后执行更新
    if (debug) console.log("saveChange", changes);
    await sqlx.exec(changes);

    // 更新远程结果
    if (options.refreshWhenSave) {
      await fetchRemoteMeta();
      resetLocalChange();
    }
  }

  /**
   * 重新加载数据：重置本地修改并从远程获取最新数据
   */
  async function reload(): Promise<void> {
    resetLocalChange();
    await fetchRemoteMeta();
  }

  /*---------------------------------------------
                    
                  输出特性
  
  ---------------------------------------------*/
  return {
    // 数据模型
    _local,
    status: _action_status,
    remoteMeta: _remote,
    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    MetaId,
    MetaData,
    changed,
    isNew,
    hasRemoteMeta,
    ActionStatus,
    ActionBarVars,
    LoadStatus,
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
    isChanged: () => _local.isChanged(),
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    clearRemoteMeta,
    setRemoteMeta,
    reset,
    dropChange,

    setActionStatus,
    updateMeta,
    setMeta,

    makeChanges,
    joinChanges,
    getDiffMeta,
    makeConflict,
    createConflictBy,
    applyConflicts,
    //---------------------------------------------
    //                  远程操作
    //---------------------------------------------
    loadRemoteMeta,
    fetchRemoteMeta,
    saveChange,
    reload,
  };
}

export function useRdsMetaStore(options: RdsMetaStoreOptions): RdsMetaStoreApi {
  return defineRdsMetaStore(options);
}
