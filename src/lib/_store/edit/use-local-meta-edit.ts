import {
  getSqlStr,
  PatchMeta,
  patchMetaBy,
  SqlExecAction,
  SqlExecFetchBack,
  SqlExecPreError,
  SqlExecSetVar,
  SqlMakeChangeResult,
  SqlResult,
  useMakeMetaChange,
} from "@site0/ti-walnut";
import { MakeDiffOptions, TableRowID, Util, Vars } from "@site0/tijs";
import _ from "lodash";
import { Ref, ref } from "vue";
import { join_exec_set_vars, SqlInsertSet } from "./join-exec-set-vars";

/**
 * useLocalMetaEdit 是一个用于管理本地元数据编辑的钩子函数。
 */
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

  /**
   * @see {@link PatchMeta}
   */
  patchMetaUpdate?: null | PatchMeta;
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
  patchMetaUpdate?: PatchMeta | null;
};

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
  //---------------------------------------------
  // 分析参数
  //---------------------------------------------
  let {
    getId = "id",
    isNew = (meta: SqlResult) => "new" == meta.id || _.isNil(meta.id),
  } = setup;
  //---------------------------------------------
  const patchMetaWhenUpdate = function (
    meta: Vars,
    id: TableRowID,
    remote: SqlResult
  ) {
    patchMetaBy(meta, id, remote, setup.patchMetaUpdate);
  };
  //---------------------------------------------
  // 数据模型
  //---------------------------------------------
  let _local_meta = ref<SqlResult>();

  /*---------------------------------------------
                    
                   方法
  
  ---------------------------------------------*/
  function isNewMeta() {
    if (!remoteMeta.value) {
      return true;
    }
    if (_local_meta.value) {
      return isNew(_local_meta.value);
    }
    return isNew(remoteMeta.value);
  }
  //---------------------------------------------
  function isChanged() {
    if (isNewMeta()) {
      return !_.isEmpty(_local_meta.value);
    }
    if (_local_meta.value) {
      return !_.isEqual(remoteMeta.value, _local_meta.value);
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
    if (_local_meta.value) {
      _local_meta.value = undefined;
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
    if (!_local_meta.value) {
      _local_meta.value = Util.jsonClone(remoteMeta.value || {});
    }

    // 更新一下
    _.assign(_local_meta.value, change);
  }

  function setMeta(meta: SqlResult) {
    _local_meta.value = meta;
  }

  function getDiffMeta(): Vars {
    if (isNewMeta()) {
      if (_local_meta.value) {
        return Util.jsonClone(_local_meta.value);
      }
      return Util.jsonClone(remoteMeta.value || {});
    }
    if (_local_meta.value) {
      return Util.getRecordDiff(remoteMeta.value ?? {}, _local_meta.value, {
        checkRemoveFromOrgin: true,
      });
    }
    return {};
  }

  function makeChange(
    options: LocalMetaMakeChangeOptions
  ): SqlMakeChangeResult {
    // 防一下空
    if (!_local_meta.value || _.isEmpty(_local_meta.value)) {
      return { changes: [] };
    }

    // 准备两个更新对象和一个错误列表
    const insertMeta = ref<Vars>();
    const updateMeta = ref<Vars>();
    const errors: SqlExecPreError[] = [];
    // 准备参数
    const _make = useMakeMetaChange({
      ...options,
      getErrMessageForInsert: options.getErrMessageForInsert,
      getErrMessageForUpdate: options.getErrMessageForUpdate,
      patchMetaWhenUpdate,
      addMetaForInsert: (meta) => {
        insertMeta.value = meta;
      },
      addMetaForUpdate: (meta) => {
        updateMeta.value = meta;
      },
      addError: (err) => {
        errors.push(err);
      },
    });

    // 准备远端数据和当前数据
    let local = _local_meta.value;
    let remote = remoteMeta.value;
    let id = getMetaId(local);

    // 生成差异
    if (!remote) {
      _make.joinChangeForInsert({
        index: 0,
        id,
        local,
      });
    }
    // 更新的差异
    else {
      _make.joinChangeForUpdate({
        index: 0,
        id,
        local,
        remote,
      });
    }

    let sets = [] as SqlExecSetVar[];
    let sql: string | undefined = undefined;
    let put: string | undefined = getSqlStr(options.updatePut);
    let vars: Vars | undefined = undefined;
    // 新创建的记录需要设置更多字段
    if (insertMeta.value) {
      vars = insertMeta.value;
      sql = getSqlStr(options.insertSql);
      put = getSqlStr(options.insertPut);
      join_exec_set_vars(sets, options.insertSet);
    }
    // 已经存在的，那么要把 ID 设置一下
    else if (updateMeta.value) {
      vars = updateMeta.value;
      sql = getSqlStr(options.updateSql);
      put = getSqlStr(options.updatePut);
    }

    // 再次防空
    if (!sql || !vars) {
      return { changes: [] };
    }

    // 更新后自动取回
    let fb: SqlExecFetchBack | undefined = undefined;
    if (options.fetchBack) {
      fb = options.fetchBack(local, remote);
    }
    return {
      changes: [
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
    localMeta: _local_meta,
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
