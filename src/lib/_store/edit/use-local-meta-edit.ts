import {
  MakeDiffOptions,
  MetaPatcher,
  UpdateMetaPatcher,
  Util,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { Ref, ref } from "vue";
import {
  SqlExecFetchBack,
  SqlExecInfo,
  SqlExecSetVar,
  SqlResult,
} from "../../../lib";
import { join_exec_set_vars, SqlInsertSet } from "./join-exec-set-vars";

export type LocalMetaEditOptions = {
  isNew?: (meta: SqlResult) => boolean;
};

export type LocalMetaPatcher = MetaPatcher;
export type LocalUpdateMetaPatcher = UpdateMetaPatcher;
export type LocalMetaMakeDiffOptions = MakeDiffOptions;

export type LocalMetaMakeChangeOptions = LocalMetaMakeDiffOptions & {
  updateSql: string;
  insertSql: string;
  insertSet?: SqlInsertSet;
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
  let { isNew = (meta: SqlResult) => "new" == meta.id || _.isNil(meta.id) } =
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
      localMeta.value = Util.jsonClone(remoteMeta.value || {});
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
        return Util.jsonClone(localMeta.value);
      }
      return Util.jsonClone(remoteMeta.value || {});
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
    let diffOrNewMeta = getDiffMeta();
    if (_.isEmpty(diffOrNewMeta)) {
      return [];
    }

    // 语法上防一下空
    if (!localMeta.value) {
      return [];
    }
    let local = localMeta.value;
    let remote = remoteMeta.value;

    let overmode = options.overrideMode || "assign";
    let overrideForUpdate = /^override-(all|update)$/.test(overmode);
    let overrideForInsert = /^override-(all|insert)$/.test(overmode);

    let sets = [] as SqlExecSetVar[];
    let sql = options.updateSql;
    let put: string | undefined = options.updatePut;
    // 新创建的记录需要设置更多字段
    if (isNewMeta()) {
      sql = options.insertSql;
      put = options.insertPut;
      // 创建时间， 对于 st/st_rsn 数据库里有默认值
      if (options.insertMeta) {
        // 动态计算
        if (_.isFunction(options.insertMeta)) {
          let new_meta2 = options.insertMeta(local, remote);
          _.assign(diffOrNewMeta, new_meta2);
          // 直接替换为新的
          if (overrideForInsert) {
            if (!new_meta2) return [];
            diffOrNewMeta = new_meta2;
          }
          // 合并两个值
          else {
            _.assign(diffOrNewMeta, new_meta2);
          }
        }
        // 静态值
        else {
          _.assign(diffOrNewMeta, options.insertMeta);
        }
      }
      // 自动生成 ID
      join_exec_set_vars(sets, options.insertSet);
    }
    // 已经存在的，那么要把 ID 设置一下
    else if (options.updateMeta) {
      // 动态计算
      if (_.isFunction(options.updateMeta)) {
        let new_diff = options.updateMeta(local, remote!, diffOrNewMeta);
        // 直接替换为新的
        if (overrideForUpdate) {
          if (!new_diff) return [];
          diffOrNewMeta = new_diff;
        }
        // 合并两个值
        else {
          _.assign(diffOrNewMeta, new_diff);
        }
      }
      // 静态值
      else {
        _.assign(diffOrNewMeta, options.updateMeta);
      }
    }

    if (options.defaultMeta) {
      // 动态计算
      if (_.isFunction(options.defaultMeta)) {
        _.assign(diffOrNewMeta, options.defaultMeta(local, remote));
      }
      // 静态值
      else {
        _.assign(diffOrNewMeta, options.defaultMeta);
      }
    }

    let fb: SqlExecFetchBack | undefined = undefined;
    if (options.fetchBack) {
      fb = options.fetchBack(local, remote);
    }
    return [
      {
        sql,
        vars: diffOrNewMeta,
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
