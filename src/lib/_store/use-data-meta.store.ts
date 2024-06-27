import _ from 'lodash';
import { ComputedRef, Ref, computed, ref } from 'vue';
import {
  LocalMetaEditOptions,
  LocalMetaMakeChangeOptions,
  QueryFilter,
  SqlExecOptions,
  SqlResult,
  useLocalMetaEdit,
  useSqlx,
} from '../../lib';
import { getLogger } from '@site0/tijs';

const log = getLogger('wn.use-data-meta-store');

export type DataMetaStoreStatus = 'loading' | 'saving';

export type DataMetaStoreFeature = {
  //---------------------------------------------
  // 数据模型
  _local: any;
  filter: Ref<QueryFilter>;
  status: Ref<DataMetaStoreStatus | undefined>;
  remoteMeta: Ref<SqlResult | undefined>;
  //---------------------------------------------
  // 计算属性
  metaData: ComputedRef<SqlResult>;
  //---------------------------------------------
  // Getter
  isNew: () => boolean;
  isChanged: () => boolean;
  getFilterField: (key: string, dft?: any) => any;
  //---------------------------------------------
  // 本地方法
  resetLocalChange: () => void;

  updateFilter: (filter: QueryFilter) => void;
  setFilter: (filter: QueryFilter) => void;

  updateMeta: (meta: SqlResult) => void;
  setMeta: (meta: SqlResult) => void;

  makeChanges: () => SqlExecOptions[];
  //---------------------------------------------
  //  远程方法
  fetchRemoteMeta: () => Promise<void>;
  saveChange: () => Promise<void>;
  reload: () => Promise<void>;
  //---------------------------------------------
};

export type DataMetaStoreOptions = LocalMetaEditOptions & {
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
function defineDataMetaStore(
  options: DataMetaStoreOptions
): DataMetaStoreFeature {
  //---------------------------------------------
  // 准备数据访问模型
  let sqlx = useSqlx();
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const remoteMeta = ref<SqlResult>({});
  const _status = ref<DataMetaStoreStatus>();
  const _filter = ref(options.filter);
  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = computed(() => useLocalMetaEdit(remoteMeta, options));

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
    _status.value = 'loading';
    let re = await sqlx.fetch(options.sqlFetch, _filter.value);
    if (re && options.patchRemote) {
      re = options.patchRemote(re);
    }
    remoteMeta.value = re ?? {};
    _status.value = undefined;
  }

  function makeChanges(): SqlExecOptions[] {
    // 保护一下
    if (!options.makeChange) {
      log.warn('without options.makeChange');
      return [];
    }
    // 获取改动信息
    let changes = [] as SqlExecOptions[];
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

/**
 * 维持全局单例
 */
export function useDataMetaStore(
  options: DataMetaStoreOptions
): DataMetaStoreFeature {
  return defineDataMetaStore(options);
}
