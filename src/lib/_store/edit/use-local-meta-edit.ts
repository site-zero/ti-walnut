import { SqlExecOptions, SqlExecSetVar, SqlResult } from '@site0/ti-walnut';
import { Util, Vars } from '@site0/tijs';
import _ from 'lodash';
import { Ref, ref } from 'vue';

export type LocalMetaEditOptions = {
  isNew?: (meta: SqlResult) => boolean;
};

export type LocalMetaMakeChangeOptions = {
  defaultMeta?: Vars;
  updateSql: string;
  insertSql: string;
  insertMeta?: Vars;
  insertSet?: SqlExecSetVar[];
  updateMeta?: Vars;
  fetchBack?: [string, (Vars | undefined)?];
  noresult?: boolean;
};

export function useLocalMetaEdit(
  remoteMeta: Ref<SqlResult>,
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
      return Util.getRecordDiff(remoteMeta.value, localMeta.value, {
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

    _.defaults(vars, options.defaultMeta);
    let sets = [] as SqlExecSetVar[];
    let sql = options.updateSql;
    // 新创建的 consol 需要设置更多字段
    if (isNewMeta()) {
      sql = options.insertSql;
      // 创建时间， 对于 st/st_rsn 数据库里有默认值
      _.assign(vars, options.insertMeta);
      // 自动生成 ID
      if (options.insertSet) {
        sets.push(...options.insertSet);
      }
    }
    // 已经存在的，那么要把 ID 设置一下
    else {
      _.assign(vars, options.updateMeta);
    }
    return [
      {
        sql,
        vars,
        explain: true,
        reset: true,
        noresult: options.noresult,
        sets,
        fetchBack: options.fetchBack,
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
