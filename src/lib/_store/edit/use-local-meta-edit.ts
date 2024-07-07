import { SqlExecOptions, SqlExecSetVar, SqlResult } from '@site0/ti-walnut';
import { Util, Vars } from '@site0/tijs';
import _ from 'lodash';
import { Ref, ref } from 'vue';

export type LocalMetaEditOptions = {
  isNew?: (meta: SqlResult) => boolean;
};

export type LocalMetaMakeChangeOptions = {
  updateSql: string;
  insertSql: string;
  defaultMeta?: (local: SqlResult, remote?: SqlResult) => Vars;
  insertMeta?: (local: SqlResult, remote?: SqlResult) => Vars;
  updateMeta?: (local: SqlResult, remote?: SqlResult) => Vars;
  insertSet?: SqlExecSetVar[];
  fetchBack?: (
    local: SqlResult,
    remote?: SqlResult
  ) => [string, (Vars | undefined)?];
  noresult?: boolean;
};

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

  function makeChange(options: LocalMetaMakeChangeOptions): SqlExecOptions[] {
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
    // 新创建的 consol 需要设置更多字段
    if (isNewMeta()) {
      sql = options.insertSql;
      // 创建时间， 对于 st/st_rsn 数据库里有默认值
      if (options.insertMeta) {
        _.assign(vars, options.insertMeta(local, remote));
      }
      // 自动生成 ID
      if (options.insertSet) {
        sets.push(...options.insertSet);
      }
    }
    // 已经存在的，那么要把 ID 设置一下
    else if (options.updateMeta) {
      _.assign(vars, options.updateMeta(local, remote));
    }

    let fb: [string, (Vars | undefined)?] | undefined = undefined;
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
        fetchBack: fb,
      },
    ];
  }
  /*---------------------------------------------
                    
                   返回特性
  
  ---------------------------------------------*/
  return {
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
