import {
  SqlExecFetchBack,
  SqlExecInfo,
  SqlExecSetVar,
  SqlResult,
} from '@site0/ti-walnut';
import { Util, Vars } from '@site0/tijs';
import _ from 'lodash';
import { Ref, ref } from 'vue';

export type LocalMetaEditOptions = {
  isNew?: (meta: SqlResult) => boolean;
};

export type LocalMetaMakeDiffOptions = {
  defaultMeta?: (local: SqlResult, remote?: SqlResult) => Vars | undefined;
  insertMeta?: (local: SqlResult, remote?: SqlResult) => Vars | undefined;
  updateMeta?: (local: SqlResult, remote: SqlResult) => Vars | undefined;
};

export type LocalMetaMakeChangeOptions = LocalMetaMakeDiffOptions & {
  updateSql: string;
  insertSql: string;
  insertSet?: () => SqlExecSetVar[] | undefined;
  insertPut?: string;
  updatePut?: string;
  fetchBack?: (local: SqlResult, remote?: SqlResult) => SqlExecFetchBack;
  noresult?: boolean;
};

export type LocalMetaEdit = ReturnType<typeof useLocalMetaEdit>;

export function useLocalMetaEdit(
  remoteMeta: Ref<SqlResult | undefined>,
  options: LocalMetaEditOptions = {}
) {
  let { isNew = (meta: SqlResult) => 'new' == meta.id || _.isNil(meta.id) } =
    options;
  /*---------------------------------------------
                    
                 数据模型
  
  ---------------------------------------------*/
  let localMeta = ref<SqlResult>();

  /*---------------------------------------------
                    
                   方法
  
  ---------------------------------------------*/
  function isNewMeta() {
    if (!remoteMeta.value) {
      return true;
    }
    if (localMeta.value) {
      return isNew(localMeta.value);
    }
    return isNew(remoteMeta.value);
  }

  function isChanged() {
    if (isNewMeta()) {
      return !_.isEmpty(localMeta.value);
    }
    if (localMeta.value) {
      return !_.isEqual(remoteMeta.value, localMeta.value);
    }
    return false;
  }

  function reset() {
    if (localMeta.value) {
      localMeta.value = undefined;
    }
  }

  /**
   * 更新一条记录的某个字段
   *
   * @param payload Shipment 单元格改动
   */
  function updateMeta(change: SqlResult) {
    // 自动生成 localMeta
    if (!localMeta.value) {
      localMeta.value = _.cloneDeep(remoteMeta.value || {});
    }

    // 更新一下
    _.assign(localMeta.value, change);
  }

  function setMeta(meta: SqlResult) {
    localMeta.value = meta;
  }

  function getDiffMeta(): Vars {
    if (isNewMeta()) {
      if (localMeta.value) {
        return _.cloneDeep(localMeta.value);
      }
      return _.cloneDeep(remoteMeta.value || {});
    }
    if (localMeta.value) {
      return Util.getRecordDiff(remoteMeta.value ?? {}, localMeta.value, {
        checkRemoveFromOrgin: true,
      });
    }
    return {};
  }

  function makeChange(options: LocalMetaMakeChangeOptions): SqlExecInfo[] {
    // 检查 Console
    let vars = getDiffMeta();
    if (_.isEmpty(vars)) {
      return [];
    }

    // 语法上防一下空
    if (!localMeta.value) {
      return [];
    }
    let local = localMeta.value;
    let remote = remoteMeta.value;

    if (options.defaultMeta) {
      _.defaults(vars, options.defaultMeta(local, remote));
    }

    let sets = [] as SqlExecSetVar[];
    let sql = options.updateSql;
    let put: string | undefined = options.updatePut;
    // 新创建的记录需要设置更多字段
    if (isNewMeta()) {
      sql = options.insertSql;
      put = options.insertPut;
      // 创建时间， 对于 st/st_rsn 数据库里有默认值
      if (options.insertMeta) {
        _.assign(vars, options.insertMeta(local, remote));
      }
      // 自动生成 ID
      if (options.insertSet) {
        let insertSets = options.insertSet();
        if (insertSets) {
          sets.push(...insertSets);
        }
      }
    }
    // 已经存在的，那么要把 ID 设置一下
    else if (options.updateMeta) {
      _.assign(vars, options.updateMeta(local, remote!));
    }

    let fb: SqlExecFetchBack | undefined = undefined;
    if (options.fetchBack) {
      fb = options.fetchBack(local, remote);
    }
    return [
      {
        sql,
        vars,
        explain: true,
        reset: true,
        noresult: options.noresult,
        sets,
        put,
        fetchBack: fb,
      },
    ];
  }
  /*---------------------------------------------
                    
                   返回特性
  
  ---------------------------------------------*/
  return {
    remoteMeta,
    localMeta,
    isNewMeta,
    isChanged,
    reset,
    updateMeta,
    setMeta,
    getDiffMeta,
    makeChange,
  };
}
