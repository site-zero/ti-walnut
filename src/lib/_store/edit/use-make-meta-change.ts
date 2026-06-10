import { SqlExecPreError, SqlResult } from "@site0/ti-walnut";
import { MakeDiffOptions, TableRowID, Util, Vars } from "@site0/tijs";
import _ from "lodash";

export type MakeMetaChangeOptions = MakeDiffOptions & {
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

  /**
   * 在更新时，指定要补上的固定字段，或者动态计算要补上的字段
   * 默认的会补上 "id"
   */
  patchMetaWhenUpdate?: PatchMeta;

  addMetaForInsert: (meta: Vars) => void;
  addMetaForUpdate: (meta: Vars) => void;
  addError?: (err: SqlExecPreError) => void;
};

export type MakeMetaChangeParams = {
  index: number;
  id: TableRowID;
  local: SqlResult;
  remote?: SqlResult;
};

/**
 * 在 `makeChange` 时使用的补丁元数据更新函数。
 * 如果指定为 `null`，则不会自动添加更新 ID。
 *
 * @param diff - 变量的差异
 * @param id - 表行 ID
 * @param remote - 远程 SQL 结果
 */
export type PatchMeta = (diff: Vars, id: TableRowID, remote: SqlResult) => void;

/**
 * 根据提供的配置，处理元数据的新增和更新变更
 * 通过比较本地和远程数据，生成差异记录，并进行验证和数据补充
 *
 * @param options 元数据变更配置选项
 * @param setup 元数据变更初始化设置
 */
export function useMakeMetaChange(options: MakeMetaChangeOptions) {
  // 准备参数
  let {
    getErrMessageForUpdate,
    getErrMessageForInsert,
    patchMetaWhenUpdate,
    addMetaForInsert,
    addMetaForUpdate,
    addError,
  } = options;

  // 默认行为
  if (!getErrMessageForInsert) {
    getErrMessageForInsert = dftGetErrMessageForInsertOrUpdate;
  }
  if (!getErrMessageForUpdate) {
    getErrMessageForUpdate = dftGetErrMessageForInsertOrUpdate;
  }

  // 重载模式
  let overmode = options.overrideMode || "assign";
  let overrideForUpdate = /^override-(all|update)$/.test(overmode);
  let overrideForInsert = /^override-(all|insert)$/.test(overmode);

  /**
   * 比较本地和远程数据，生成更新差异记录
   * 验证差异数据，应用更新元数据和默认元数据，最后添加到更新列表
   *
   * @param index 数据索引
   * @param id 表行ID
   * @param remote 远程数据记录
   * @param local 本地数据记录
   * @returns 无返回值
   */
  function joinChangeForUpdate(setup: Required<MakeMetaChangeParams>) {
    // 准备上下文
    let { index, id, local, remote } = setup;

    // 比较差异
    let diff = Util.getRecordDiff(remote, local, {
      checkRemoveFromOrgin: true,
    });
    if (_.isEmpty(diff)) {
      return;
    }

    // 检查数据
    if (getErrMessageForUpdate) {
      let errMsg = getErrMessageForUpdate(diff);
      if ("skip" == errMsg) {
        return;
      }
      if (errMsg && addError) {
        addError({
          index: index,
          rowId: id,
          errMsg,
        });
      }
    }

    // 指定固定更新数据
    if (options.updateMeta) {
      // 动态计算
      if (_.isFunction(options.updateMeta)) {
        let new_diff = options.updateMeta(local, remote, diff);
        // 直接替换为新的
        if (overrideForUpdate) {
          if (!new_diff) return;
          diff = new_diff;
        }
        // 合并两个值
        else {
          _.assign(diff, new_diff);
        }
      }
      // 静态值
      else {
        _.assign(diff, options.updateMeta);
      }
    }

    // 忽略未定义值
    let delta: SqlResult = _.omitBy(diff, (v) => _.isUndefined(v));

    // 没啥好更新的
    if (_.isEmpty(delta)) {
      return;
    }

    // 补上固定 Meta
    if (patchMetaWhenUpdate) {
      patchMetaWhenUpdate(delta, id, remote);
    }

    // 默认值
    if (options.defaultMeta) {
      // 动态计算
      if (_.isFunction(options.defaultMeta)) {
        let dftDiff = options.defaultMeta(local, remote);
        _.assign(delta, dftDiff);
      }
      // 静态值
      else {
        _.assign(delta, options.defaultMeta);
      }
    }

    // 无论如何记入列表
    addMetaForUpdate(delta);
  }

  /**
   * 验证本地数据，应用插入元数据和默认元数据，最后添加到插入列表
   *
   * @param index 数据索引
   * @param id 表行ID
   * @param local 本地数据记录
   * @returns 无返回值
   */
  function joinChangeForInsert(params: MakeMetaChangeParams) {
    // 准备上下文
    let { index, id, local } = params;

    // 生成克隆数据，避免直接修改本地数据
    let newMeta = _.cloneDeep(local);

    // 检查数据
    if (getErrMessageForInsert) {
      let errMsg = getErrMessageForInsert(newMeta);
      if ("skip" == errMsg) {
        return;
      }
      if (errMsg && addError) {
        addError({
          index: index,
          rowId: id,
          errMsg,
        });
      }
    }

    // 插入的固定数据
    if (options.insertMeta) {
      // 动态计算
      if (_.isFunction(options.insertMeta)) {
        let new_meta2 = options.insertMeta(local);
        // 直接替换为新的
        if (overrideForInsert) {
          if (!new_meta2) return;
          newMeta = new_meta2;
        }
        // 合并两个值
        else {
          _.assign(newMeta, new_meta2);
        }
      }
      // 静态值
      else {
        _.assign(newMeta, options.insertMeta);
      }
    }

    // 默认数据
    if (options.defaultMeta) {
      // 动态计算
      if (_.isFunction(options.defaultMeta)) {
        _.assign(newMeta, options.defaultMeta(local));
      }
      // 静态值
      else {
        _.assign(newMeta, options.defaultMeta);
      }
    }

    // 忽略未定义值
    newMeta = _.omitBy(newMeta, (v) => v === undefined);

    // 没啥好插入的
    if (_.isEmpty(newMeta)) {
      return;
    }

    // 无论如何加入插入列表
    addMetaForInsert(newMeta);
  }

  //---------------------------------------------
  // 返回接口
  //---------------------------------------------
  return {
    joinChangeForUpdate,
    joinChangeForInsert,
  };
}

export function dftGetErrMessageForInsertOrUpdate(
  meta: Vars
): string | "skip" | undefined {
  // 过滤掉所有 undefined 的值，以及 id 字段（如果存在）
  let cleanMeta = _.omitBy(meta, (v, k) => _.isUndefined(v) || k === "id");
  if (_.isEmpty(cleanMeta)) {
    return "skip";
  }
  return undefined;
}

export function patchMetaBy(
  meta: Vars,
  id: TableRowID,
  remote: SqlResult,
  patch?: PatchMeta | null
) {
  // 调用者明确阻止
  if (_.isNull(patch)) {
    return;
  }
  // 自定义 Patch
  else if (patch) {
    patch(meta, id, remote);
  }
  // 默认 Patch
  else {
    meta.id = id;
  }
}
