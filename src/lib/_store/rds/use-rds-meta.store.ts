import {
  buildConflict,
  buildDifferentItem,
  ConflictItem,
  getLogger,
  Util,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { computed, ref } from "vue";
import {
  DataStoreActionStatus,
  DataStoreLoadStatus,
  LocalMetaEditOptions,
  LocalMetaMakeChangeOptions,
  QueryFilter,
  SqlExecInfo,
  SqlResult,
  useLocalMetaEdit,
  useSqlx,
} from "../../";

const log = getLogger("wn.use-data-meta-store");

export type RdsMetaStoreApi = ReturnType<typeof defineRdsMetaStore>;

export type RdsMetaStoreOptions = LocalMetaEditOptions & {
  daoName?: string;
  filter: QueryFilter;
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
  const _filter = ref<QueryFilter>(options.filter);
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

  function dropChange() {
    _local.reset();
  }

  function resetLocalChange() {
    _local.reset();
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

  async function loadRemoteMeta(): Promise<SqlResult | undefined> {
    //console.log('I am fetch remote', _filter.value);
    _action_status.value = "loading";
    try {
      let re = await sqlx.fetch(options.sqlFetch, _filter.value);
      if (re && options.patchRemote) {
        re = options.patchRemote(re);
      }
      return re;
    } finally {
      _action_status.value = undefined;
    }
  }

  async function fetchRemoteMeta(): Promise<void> {
    _remote.value = await loadRemoteMeta();
  }

  function makeChanges(): SqlExecInfo[] {
    // 保护一下
    if (!options.makeChange) {
      log.warn("without options.makeChange");
      return [];
    }
    // 获取改动信息
    let changes = [] as SqlExecInfo[];
    changes.push(..._local.makeChange(options.makeChange));

    log.debug("makeChanges", changes);
    return changes;
  }

  function getDiffMeta() {
    return _local.getDiffMeta();
  }

  async function makeConflict(): Promise<ConflictItem | undefined> {
    // 首先从服务器拉取数据，然后我们就有了三个数据版本
    let server = await loadRemoteMeta();
    let local = _local.localMeta.value;
    let remote = _remote.value;

    // 比对差异
    let myDiff = buildDifferentItem(local, remote);
    let taDiff = buildDifferentItem(server, remote);

    // 算冲突
    let conflict = buildConflict(myDiff, taDiff);
    return conflict;
  }

  /*---------------------------------------------
                    
                  输出特性
  
  ---------------------------------------------*/
  return {
    // 数据模型
    _local,
    status: _action_status,
    filter: _filter,
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
    getFilterField: (key: string, dft?: any) => {
      return _.get(_filter, key) ?? dft;
    },
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    resetLocalChange,
    clearRemoteMeta,
    reset,
    dropChange,

    updateFilter(filter: QueryFilter) {
      _.assign(_filter.value, filter);
    },

    setFilter(filter: QueryFilter) {
      _filter.value = filter;
    },

    updateMeta(meta: SqlResult) {
      _local.updateMeta(meta);
    },

    setMeta(meta: SqlResult) {
      _local.setMeta(meta);
    },

    setRemoteMeta(meta: SqlResult) {
      _remote.value = Util.jsonClone(meta);
    },

    makeChanges,
    getDiffMeta,
    makeConflict,
    //---------------------------------------------
    //                  远程方法
    //---------------------------------------------
    fetchRemoteMeta,

    saveChange: async (): Promise<void> => {
      // 获取改动信息
      let changes = makeChanges();

      // 保护一下
      if (changes.length == 0) {
        return;
      }

      // 最后执行更新
      log.debug("saveChange", changes);
      await sqlx.exec(changes);

      // 更新远程结果
      if (options.refreshWhenSave) {
        await fetchRemoteMeta();
        resetLocalChange();
      }
    },

    reload: async (): Promise<void> => {
      resetLocalChange();
      await fetchRemoteMeta();
    },
  };
}

export function useRdsMetaStore(options: RdsMetaStoreOptions): RdsMetaStoreApi {
  return defineRdsMetaStore(options);
}
