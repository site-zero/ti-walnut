import {
  getSqlStr,
  SqlExecAction,
  SqlExecFetchBack,
  SqlExecPreError,
  SqlExecSetVar,
  SqlMakeChangeResult,
  SqlResult,
} from "@site0/ti-walnut";
import { MakeDiffOptions, TableRowID, Util, Vars } from "@site0/tijs";
import _ from "lodash";
import { Ref, ref } from "vue";
import { join_exec_set_vars, SqlInsertSet } from "./join-exec-set-vars";

export type LocalMetaEditSetup = {
  isNew?: (meta: SqlResult) => boolean;
  /**
   * 从指定对象获取 ID 的方法。
   *
   * - `string` : 表示一个数据键，将通过 `_.get` 获取值，这个值必须是 `T` 或者可以被 `anyConvertor` 转换的值
   * - `Function` : 一个获取 ID 的函数
   *
   * @param it - SQL 结果
   * @param index - 索引
   * @returns 表行 ID
   */
  getId?: string | ((it: SqlResult) => TableRowID);
};

// export type LocalMetaPatcher = MetaPatcher;
// export type LocalUpdateMetaPatcher = UpdateMetaPatcher;
export type LocalMetaMakeDiffOptions = MakeDiffOptions & {
  /**
   * 为了确保数据不会被错误的更新，可以指明一个检查函数
   *
   * @param meta  要更新的数据记录字段
   * @returns 错误信息，如果合法则返回 undefined
   */
  getErrMessageForUpdate?: (meta: Vars) => string | "skip" | undefined;
  /**
   * 为了确保数据不会被错误的插入，可以指明一个检查函数
   *
   * @param meta  要插入的数据记录字段
   * @returns 错误信息，如果合法则返回 undefined
   */
  getErrMessageForInsert?: (meta: Vars) => string | "skip" | undefined;
};

export function dftGetErrMessageForInsertOrUpdate(
  meta: Vars
): string | "skip" | undefined {
  // 过滤掉所有 undefined 的值，以及 id 字段（如果存在）
  let cleanMeta = _.omitBy(meta, (v, k) => _.isUndefined(v) || k === "id");
  if (_.isEmpty(cleanMeta)) {
    return "skip";
  }
}

export type LocalMetaMakeChangeOptions = LocalMetaMakeDiffOptions & {
  updateSql?: string | (() => string);
  insertSql?: string | (() => string);
  insertSet?: SqlInsertSet;
  insertPut?: string | (() => string);
  updatePut?: string | (() => string);
  fetchBack?: (local: SqlResult, remote?: SqlResult) => SqlExecFetchBack;
  noresult?: boolean;
};

export type LocalMetaEdit = ReturnType<typeof useLocalMetaEdit>;

export function useLocalMetaEdit(
  remoteMeta: Ref<SqlResult | undefined>,
  setup: LocalMetaEditSetup = {}
) {
  let {
    getId = "id",
    isNew = (meta: SqlResult) => "new" == meta.id || _.isNil(meta.id),
  } = setup;
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
  //---------------------------------------------
  function isChanged() {
    if (isNewMeta()) {
      return !_.isEmpty(localMeta.value);
    }
    if (localMeta.value) {
      return !_.isEqual(remoteMeta.value, localMeta.value);
    }
    return false;
  }
  //---------------------------------------------
  /**
   * 获取数据的 ID
   */
  function getMetaId(it: SqlResult): TableRowID {
    if (_.isString(getId)) {
      return _.get(it, getId) ?? "--no-id--";
    }
    return getId(it) ?? "--no-id--";
  }
  //---------------------------------------------
  function reset() {
    if (localMeta.value) {
      localMeta.value = undefined;
    }
  }
  //---------------------------------------------
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

  function makeChange(
    options: LocalMetaMakeChangeOptions
  ): SqlMakeChangeResult {
    // 准备参数
    let { getErrMessageForUpdate, getErrMessageForInsert } = options;
    if (!getErrMessageForInsert) {
      getErrMessageForInsert = dftGetErrMessageForInsertOrUpdate;
    }
    if (!getErrMessageForUpdate) {
      getErrMessageForUpdate = dftGetErrMessageForInsertOrUpdate;
    }

    // 检查 Console
    let diffOrNewMeta = getDiffMeta();
    if (_.isEmpty(diffOrNewMeta)) {
      return { changes: [] };
    }

    const errors: SqlExecPreError[] = [];

    // 语法上防一下空
    if (!localMeta.value) {
      return { changes: [] };
    }
    let local = localMeta.value;
    let remote = remoteMeta.value;

    let overmode = options.overrideMode || "assign";
    let overrideForUpdate = /^override-(all|update)$/.test(overmode);
    let overrideForInsert = /^override-(all|insert)$/.test(overmode);

    let sets = [] as SqlExecSetVar[];
    let sql = options.updateSql;
    let put: string | undefined = getSqlStr(options.updatePut);
    // 新创建的记录需要设置更多字段
    if (isNewMeta()) {
      sql = getSqlStr(options.insertSql);
      if (!sql) {
        return { changes: [] };
      }
      put = getSqlStr(options.insertPut);
      // 创建时间， 对于 st/st_rsn 数据库里有默认值
      if (options.insertMeta) {
        // 动态计算
        if (_.isFunction(options.insertMeta)) {
          let new_meta2 = options.insertMeta(local, remote);
          _.assign(diffOrNewMeta, new_meta2);
          // 直接替换为新的
          if (overrideForInsert) {
            if (!new_meta2) return { changes: [] };
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

      // 检查一下数据
      if (getErrMessageForInsert) {
        let errMsg = getErrMessageForInsert(diffOrNewMeta);
        if ("skip" == errMsg) {
          return { changes: [] };
        }
        if (errMsg) {
          errors.push({
            index: 0,
            rowId: getMetaId(local),
            errMsg,
          });
        }
      }
    }
    // 已经存在的，那么要把 ID 设置一下
    else if (options.updateMeta) {
      // 动态计算
      if (_.isFunction(options.updateMeta)) {
        let new_diff = options.updateMeta(local, remote!, diffOrNewMeta);
        // 直接替换为新的
        if (overrideForUpdate) {
          if (!new_diff) return { changes: [] };
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

      if (getErrMessageForUpdate) {
        let errMsg = getErrMessageForUpdate(diffOrNewMeta);
        if ("skip" == errMsg) {
          return { changes: [] };
        }
        if (errMsg) {
          errors.push({
            index: 0,
            rowId: getMetaId(local),
            errMsg,
          });
        }
      }
    }

    if (!sql) {
      return { changes: [] };
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
    return {
      changes: [
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
      ],
      errors,
    };
  }

  function joinChange(
    changes: SqlExecAction[],
    options: LocalMetaMakeChangeOptions
  ): SqlExecPreError[] {
    let mcr = makeChange(options);
    if (mcr.errors && mcr.errors.length > 0) {
      return mcr.errors;
    }
    if (mcr.changes && mcr.changes.length > 0) {
      changes.push(...mcr.changes);
    }
    return [];
  }
  /*---------------------------------------------
                    
                   返回特性
  
  ---------------------------------------------*/
  return {
    remoteMeta,
    localMeta,
    isNewMeta,
    isChanged,
    getMetaId,
    reset,
    updateMeta,
    setMeta,
    getDiffMeta,
    makeChange,
    joinChange,
  };
}
