import { getLogger } from '@site0/tijs';
import _ from 'lodash';
import { computed, ref } from 'vue';
import {
  DataStoreActionStatus,
  LocalMetaEditOptions,
  LocalMetaMakeChangeOptions,
  QueryFilter,
  SqlExecInfo,
  SqlResult,
  useLocalMetaEdit,
  useSqlx,
} from '../../lib';

const log = getLogger('wn.use-data-meta-store');

export type DataMetaStore = ReturnType<typeof defineDataMetaStore>;

export type DataMetaStoreOptions = LocalMetaEditOptions & {
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
function defineDataMetaStore(options: DataMetaStoreOptions) {
  //---------------------------------------------
  // 准备数据访问模型
  let sqlx = useSqlx(options.daoName);
  //console.log('defineDataMetaStore', options);
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const remoteMeta = ref<SqlResult>();
  const _status = ref<DataStoreActionStatus>();
  const _filter = ref<QueryFilter>(options.filter);
  const hasRemoteMeta = computed(() => {
    if (!remoteMeta.value || _.isEmpty(remoteMeta.value)) {
      return false;
    }
    return true;
  });
  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = computed(() => useLocalMetaEdit(remoteMeta, options));

  function reset() {
    clearRemoteMeta();
    dropChange();
  }

  function clearRemoteMeta() {
    remoteMeta.value = undefined;
  }

  function dropChange() {
    _local.value.reset();
  }

  function resetLocalChange() {
    _local.value.reset();
  }
  //---------------------------------------------
  //                 被内部重用的方法
  //---------------------------------------------
  const metaData = computed(() => {
    return _local.value.localMeta.value || remoteMeta.value || {};
  });

  function isNewMeta() {
    if (options.isNew) {
      return options.isNew(metaData);
    }
    return _.isEmpty(remoteMeta.value);
  }

  async function fetchRemoteMeta(): Promise<void> {
    //console.log('I am fetch remote', _filter.value);
    _status.value = 'loading';
    let re = await sqlx.fetch(options.sqlFetch, _filter.value);
    if (re && options.patchRemote) {
      re = options.patchRemote(re);
    }
    remoteMeta.value = re;
    _status.value = undefined;
  }

  function makeChanges(): SqlExecInfo[] {
    // 保护一下
    if (!options.makeChange) {
      log.warn('without options.makeChange');
      return [];
    }
    // 获取改动信息
    let changes = [] as SqlExecInfo[];
    changes.push(..._local.value.makeChange(options.makeChange));

    log.debug('makeChanges', changes);
    return changes;
  }

  /*---------------------------------------------
                    
                  输出特性
  
  ---------------------------------------------*/
  return {
    // 数据模型
    _local,
    filter: _filter,
    status: _status,
    remoteMeta,
    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    metaData,
    changed: computed(() => _local.value.isChanged()),
    newMeta: computed(() => isNewMeta()),
    hasRemoteMeta,
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
    isNew: isNewMeta,
    isChanged: () => _local.value.isChanged(),
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
      _local.value.updateMeta(meta);
    },

    setMeta(meta: SqlResult) {
      _local.value.setMeta(meta);
    },

    setRemoteMeta(meta: SqlResult) {
      remoteMeta.value = _.cloneDeep(meta);
    },

    makeChanges,
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
      log.debug('saveChange', changes);
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

export function useDataMetaStore(options: DataMetaStoreOptions): DataMetaStore {
  return defineDataMetaStore(options);
}
