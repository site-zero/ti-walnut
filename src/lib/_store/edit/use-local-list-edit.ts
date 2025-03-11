import {
  Match,
  TableRowChanagePayload,
  TableRowID,
  useFieldChangeDiff,
  Util,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { computed, Ref, ref } from 'vue';
import {
  LocalMetaMakeChangeOptions,
  LocalMetaMakeDiffOptions,
  SqlExecInfo,
  SqlExecSetVar,
  SqlResult,
} from '../../../lib';

/**
 * 列表项更新选项
 */
export type ListItemUpdateOptions = {
  /**
   * 采用下标更新（优先）
   */
  index?: number;
  /**
   * 采用 ID 更新
   */
  id?: TableRowID;

  /**
   * 指定一组默认值
   */
  defaultMeta?: Vars;
};

export type DiffItem = {
  index: number;
  id: TableRowID;
  existsInRemote: boolean;
  existsInLocal: boolean;
  local: SqlResult;
  delta: SqlResult;
  remote: SqlResult;
};

/**
 * 本地列表编辑选项
 */
export type LocalListEditOptions = {
  /**
   * 在 `makeChange` 时使用的补丁元数据更新函数。
   * 如果指定为 `null`，则不会自动添加更新 ID。
   *
   * @param diff - 变量的差异
   * @param id - 表行 ID
   * @param remote - 远程 SQL 结果
   */
  patchMetaUpdate?:
    | null
    | ((diff: Vars, id: TableRowID, remote: SqlResult) => void);

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
  getId?: string | ((it: SqlResult, index: number) => TableRowID);
};

export type LocalListMakeDiffOptions = LocalMetaMakeDiffOptions;

export type LocalListMakeChangeOptions = LocalMetaMakeChangeOptions & {
  deleteSql?: string;
};

export type LocalListEdit = ReturnType<typeof useLocalListEdit>;

/**
 * useLocalListEdit 是一个用于管理本地列表编辑的钩子函数。
 * 它提供了一系列方法来操作本地列表，并根据本地列表和远程列表的差异生成相应的 SQL 执行信息。
 *
 * @param remoteList - 远程列表的引用。
 * @param options - 本地列表编辑选项。
 * @returns 包含本地列表和一系列操作方法的对象。
 *
 */
export function useLocalListEdit(
  remoteList: Ref<SqlResult[] | undefined>,
  options: LocalListEditOptions = {}
) {
  let { getId = 'id' } = options;
  let _local_list = ref<SqlResult[] | undefined>();
  //---------------------------------------------
  // 计算属性
  //---------------------------------------------
  const _id_index_map = computed(() => {
    let list = _local_list.value || remoteList.value || [];
    let re = new Map<TableRowID, number>();
    for (let i = 0; i < list.length; i++) {
      let li = list[i];
      let id = getRowId(li, i);
      re.set(id, i);
    }
    return re;
  });

  /**
   * 对远程列表编制索引
   */
  const _remote_map = computed(() => {
    let re = new Map<TableRowID, SqlResult>();
    if (remoteList.value) {
      for (let i = 0; i < remoteList.value.length; i++) {
        let remote = remoteList.value[i];
        let id = getRowId(remote, i);
        re.set(id, remote);
      }
    }
    return re;
  });
  //---------------------------------------------
  // 计算属性方法
  //---------------------------------------------
  function isChanged() {
    if (_local_list.value) {
      if (_local_list.value.length != remoteList.value?.length) {
        console.log(
          'length not equal',
          _local_list.value.length,
          remoteList.value?.length
        );
        return true;
      }
      if (!_.isEqual(remoteList.value, _local_list.value)) {
        for (let i = 0; i < _local_list.value.length; i++) {
          let remote = remoteList.value[i];
          let local = _local_list.value[i];
          let diff = Util.getRecordDiff(remote, local, {
            checkRemoveFromOrgin: true,
          });
          if (!_.isEqual(remote, local)) {
            console.log(`Item ${i} [${getRowId(local, i)}] Not Equal`, diff);
          }
        }
        return true;
      }
    }
    return false;
  }
  //---------------------------------------------
  function hasLocalList() {
    return _local_list.value ? true : false;
  }
  //---------------------------------------------
  function existsInRemote(id: TableRowID): boolean {
    return _remote_map.value.has(id);
  }
  //---------------------------------------------
  /**
   * 获取数据的 ID
   */
  function getRowId(it: SqlResult, index: number): TableRowID {
    if (_.isString(getId)) {
      return _.get(it, getId) ?? `row-${index}`;
    }
    return getId(it, index) ?? `row-${index}`;
  }
  /**
   * 获取数据的下标
   */
  function getRowIndex(id: TableRowID): number {
    return _id_index_map.value?.get(id) ?? -1;
  }
  //---------------------------------------------
  function getNextRowId(checkedIds: TableRowID[]): TableRowID | undefined {
    if (_.isEmpty(checkedIds)) {
      return;
    }
    // 编制索引
    let idMap = Util.arrayToMap(checkedIds);
    let lastId = _.last(checkedIds);

    // 开始查找
    let index = getRowIndex(lastId!);
    if (index < 0) {
      return;
    }

    // 待选列表
    let list = _local_list.value || remoteList.value || [];

    // 向后找，遇到第一个非选中的对象ID
    for (let i = index + 1; i < list.length; i++) {
      let id = getRowId(list[i], i);
      if (!idMap.has(id)) {
        return id;
      }
    }

    // 向前找，遇到第一个非选中的对象ID
    for (let i = index - 1; i >= 0; i--) {
      let id = getRowId(list![i], i);
      if (!idMap.has(id)) {
        return id;
      }
    }
  }

  /**
   * 补充数据（仅当更新时）
   */
  let patchMetaUpdate:
    | null
    | ((diff: Vars, id: TableRowID, remote: SqlResult) => void) = null;
  // 默认行为
  if (_.isUndefined(options.patchMetaUpdate)) {
    patchMetaUpdate = (diff: Vars, id: TableRowID, _remote: SqlResult) => {
      diff['id'] = id;
    };
  }
  // 用户已指定
  else if (options.patchMetaUpdate) {
    patchMetaUpdate = options.patchMetaUpdate;
  }
  //---------------------------------------------
  function initLocalList() {
    if (!_local_list.value) {
      _local_list.value = _.cloneDeep(remoteList.value || []);
      return true;
    }
    return false;
  }
  //---------------------------------------------
  function updateItem(
    meta: Vars,
    options: ListItemUpdateOptions
  ): SqlResult | undefined {
    let { index, id, defaultMeta } = options;
    let i = -1;
    if (!_.isNil(index)) {
      i = index;
    } else if (!_.isNil(id)) {
      i = getRowIndex(id);
    }
    // 采用 index 下标
    if (i >= 0) {
      initLocalList();
      if (_local_list.value && i < _local_list.value.length) {
        let re = _local_list.value[i];
        _.assign(re, meta);
        if (defaultMeta) {
          _.defaults(re, defaultMeta);
        }
        return re;
      }
    }
  }
  //---------------------------------------------
  function updateListField(
    payload: TableRowChanagePayload
  ): SqlResult | undefined {
    // 自动生成 localList
    if (!_local_list.value) {
      _local_list.value = _.cloneDeep(remoteList.value || []);
    }

    // 确定要修改的行和字段
    let { rowIndex, changed } = payload;
    let row = _local_list.value[rowIndex];

    // 应用修改修改详情列表
    useFieldChangeDiff(changed, row);

    return row;
  }
  //---------------------------------------------
  function appendToList(newItem: SqlResult) {
    // 自动生成 localList
    if (!_local_list.value) {
      _local_list.value = _.cloneDeep(remoteList.value || []);
    }

    _local_list.value.push(newItem);
  }
  //---------------------------------------------
  function append(...newItems: SqlResult[]) {
    // 自动生成 localList
    if (!_local_list.value) {
      _local_list.value = _.cloneDeep(remoteList.value || []);
    }

    _local_list.value.push(...newItems);
  }
  //---------------------------------------------
  function prependToList(newItem: SqlResult) {
    // 自动生成 localList
    if (!_local_list.value) {
      _local_list.value = _.cloneDeep(remoteList.value || []);
    }

    _local_list.value.unshift(newItem);
  }
  //---------------------------------------------
  function prepend(...newItems: SqlResult[]) {
    // 自动生成 localList
    if (!_local_list.value) {
      _local_list.value = _.cloneDeep(remoteList.value || []);
    }

    _local_list.value.unshift(...newItems);
  }
  //---------------------------------------------
  function batchUpdate(
    meta: Vars,
    forIds?: TableRowID | TableRowID[]
  ): SqlResult[] {
    // 自动生成 localList
    if (!_local_list.value) {
      _local_list.value = _.cloneDeep(remoteList.value || []);
    }
    //console.log('batchUpdate', forIds, meta);

    // 全部记录
    if (_.isNil(forIds)) {
      for (let i = 0; i < _local_list.value.length; i++) {
        let local = _local_list.value[i];
        _.assign(local, meta);
      }
      return _local_list.value;
    }

    let re: SqlResult[] = [];
    // 某条指定记录
    if (_.isString(forIds) || _.isNumber(forIds)) {
      let reItem = updateItem(meta, { id: forIds });
      if (reItem) {
        re.push(reItem);
      }
    }
    // 一批记录
    else if (_.isArray(forIds)) {
      if (forIds.length > 0) {
        let ids = Util.arrayToMap(forIds);
        for (let i = 0; i < _local_list.value.length; i++) {
          let item = _local_list.value[i];
          let id = getRowId(item, i);
          if (ids.get(id)) {
            _.assign(item, meta);
            re.push(item);
          }
        }
      }
    }

    return re;
  }
  //---------------------------------------------
  function batchUpdateBy(meta: Vars, match: any): SqlResult[] {
    let am = Match.parse(match, false);
    initLocalList();
    let re: SqlResult[] = [];
    if (_local_list.value) {
      for (let it of _local_list.value) {
        if (am.test(it)) {
          _.assign(it, meta);
          re.push(it);
        }
      }
    }
    return re;
  }
  //---------------------------------------------
  function findAndUpdate(
    update: (it: SqlResult) => SqlResult | undefined
  ): SqlResult[] {
    let re: SqlResult[] = [];
    let list: SqlResult[] = [];
    initLocalList();
    if (_local_list.value) {
      for (let it of _local_list.value) {
        // 尝试更新数据
        let updatedShipmentMeta = update(it);
        if (updatedShipmentMeta) {
          list.push(updatedShipmentMeta);
          re.push(updatedShipmentMeta);
        }
        // 维持原样
        else {
          list.push(it);
        }
      }
      _local_list.value = list;
    }
    return re;
  }
  //---------------------------------------------
  function removeLocalItems(forIds?: TableRowID[]): SqlResult[] {
    // Guard
    if (!forIds || _.isEmpty(forIds)) {
      return [];
    }

    // 自动生成 localList
    if (!_local_list.value) {
      _local_list.value = _.cloneDeep(remoteList.value || []);
    }

    // Remove Local list
    let ids = Util.arrayToMap(forIds);
    let list = [] as SqlResult[];
    let removes = [] as SqlResult[];
    if (_local_list.value) {
      for (let i = 0; i < _local_list.value.length; i++) {
        let item = _local_list.value[i];
        let id = getRowId(item, i);
        // 需要删除的 ID
        if (ids.has(id)) {
          removes.push(item);
        }
        // 需要保留的 ID
        else {
          list.push(item);
        }
      }
    }
    _local_list.value = list;

    // 返回删除的对象列表
    return removes;
  }
  //---------------------------------------------
  function clearItems() {
    _local_list.value = [];
  }
  //---------------------------------------------
  /**
   * 进行本地列表的变更处理，并生成相应的 SQL 执行信息。
   *
   * @param options - 变更选项配置。
   * @returns SQL 执行的配置信息，即 useSqlx.exec 的输入参数。
   *
   * @remarks
   * 该方法会根据本地列表和远程列表的差异，生成插入、更新和删除的 SQL 执行信息。
   * 1. 如果本地列表为空，则直接返回空的变更数组。
   * 2. 对远程列表进行索引编制。
   * 3. 准备插入和更新的列表。
   * 4. 循环本地列表，生成本地列表的 ID 索引，并根据差异生成更新或插入的记录。
   * 5. 如果配置了删除 SQL，则处理删除操作。
   * 6. 生成插入和更新的 SQL 执行信息，并返回变更数组。
   *
   * @example
   * ```typescript
   * const changes = makeChanges({
   *   insertSql: 'pet.insert',
   *   updateSql: 'pet.update',
   *   deleteSql: 'pet.delete',
   *   defaultMeta: (local, remote) => ({ createdAt: new Date() }),
   *   updateMeta: (local, remote) => ({ updatedAt: new Date() }),
   *   insertMeta: (local, remote) => ({ createdBy: 'user' }),
   *   insertSet: () => [{ key: 'value' }],
   *   noresult: true,
   *   insertPut: true,
   *   updatePut: true,
   * });
   * ```
   */
  function makeChanges(options: LocalListMakeChangeOptions) {
    let changes = [] as SqlExecInfo[];

    // 如果没有做过任何修改 ...
    if (!_local_list.value) {
      return changes;
    }

    // 对远程列表编制索引
    let remoteMap = _remote_map.value;

    // 准备两个列表
    let insertList = [] as Vars[];
    let updateList = [] as Vars[];

    // 循环本地列表，顺便编制一个本地列表的ID 索引
    let localMap = new Map<TableRowID, SqlResult>();
    if (_local_list.value) {
      for (let i = 0; i < _local_list.value.length; i++) {
        let local = _local_list.value[i];
        let id = getRowId(local, i);
        localMap.set(id, local);
        let remote = remoteMap.get(id);
        // 已经存在，必然是要更新记录
        if (remote) {
          let diff = Util.getRecordDiff(remote, local, {
            checkRemoveFromOrgin: true,
          });
          if (_.isEmpty(diff)) {
            continue;
          }

          // 补上固定 Meta
          if (options.defaultMeta) {
            _.defaults(diff, options.defaultMeta(local, remote));
          }
          if (options.updateMeta) {
            _.assign(diff, options.updateMeta(local, remote));
          }

          // 补上 ID
          if (patchMetaUpdate) {
            patchMetaUpdate(diff, id, remote);
          }

          // 记入列表
          updateList.push(diff);
        }
        // 必然是新记录，需要插入
        else {
          let newMeta = _.cloneDeep(local);
          if (options.defaultMeta) {
            _.defaults(newMeta, options.defaultMeta(local, remote));
          }
          if (options.insertMeta) {
            _.assign(newMeta, options.insertMeta(local, remote));
          }
          insertList.push(newMeta);
        }
      }
    }
    // 可以支持删除，删除放在前面以便尽量避免更新时的主键冲突
    //  A,B,C
    // rm B + C update to B 是可以的
    // C update to B + rm B 会抛错，因为 B 已经存在
    if (options.deleteSql && remoteList.value) {
      for (let i = 0; i < remoteList.value.length; i++) {
        let remote = remoteList.value[i];
        let id = getRowId(remote, i);
        let local = localMap.get(id);
        if (!local) {
          changes.push({
            sql: options.deleteSql,
            vars: remote,
            explain: false,
            reset: true,
            noresult: true,
          });
        }
      }
    }

    // 对插入，生成配置
    if (!_.isEmpty(insertList)) {
      let insertSets: SqlExecSetVar[] | undefined = undefined;
      if (options.insertSet) {
        insertSets = options.insertSet();
      }
      changes.push({
        sql: options.insertSql,
        vars: insertList,
        explain: true,
        reset: true,
        noresult: options.noresult,
        put: options.insertPut,
        sets: insertSets,
      });
    }

    // 对更新，生成配置
    for (let vars of updateList) {
      changes.push({
        sql: options.updateSql,
        vars: vars,
        explain: true,
        reset: true,
        noresult: options.noresult,
        put: options.updatePut,
      });
    }

    return changes;
  }
  //---------------------------------------------
  function makeDifferents(options: LocalListMakeDiffOptions = {}): DiffItem[] {
    let re: DiffItem[] = [];

    // 如果没有做过任何修改 ...
    if (!_local_list.value) {
      return re;
    }

    // 对远程列表编制索引
    let remoteMap = _remote_map.value;

    // 循环本地列表，顺便编制一个本地列表的ID 索引
    let localMap = new Map<TableRowID, SqlResult>();
    if (_local_list.value) {
      for (let i = 0; i < _local_list.value.length; i++) {
        let local = _local_list.value[i];
        let id = getRowId(local, i);
        localMap.set(id, local);
        let remote = remoteMap.get(id);
        let diffItem = {
          index: i,
          id,
          existsInRemote: remote ? true : false,
          existsInLocal: true,
          local: _.cloneDeep(local),
          remote: _.cloneDeep(remote),
        } as DiffItem;
        // 已经存在，必然是要更新记录
        if (remote) {
          let diff = Util.getRecordDiff(remote, local, {
            checkRemoveFromOrgin: true,
          });
          if (_.isEmpty(diff)) {
            continue;
          }

          // 补上固定 Meta
          if (options.defaultMeta) {
            _.defaults(diff, options.defaultMeta(local, remote));
          }
          if (options.updateMeta) {
            _.assign(diff, options.updateMeta(local, remote));
          }

          // 补上 ID
          if (patchMetaUpdate) {
            patchMetaUpdate(diff, id, remote);
          }

          diffItem.delta = diff;
        }
        // 必然是新记录，需要插入
        else {
          let newMeta = _.cloneDeep(local);
          if (options.defaultMeta) {
            _.defaults(newMeta, options.defaultMeta(local, remote));
          }
          if (options.insertMeta) {
            _.assign(newMeta, options.insertMeta(local, remote));
          }
          diffItem.delta = newMeta;
        }
        // 记入返回列表
        re.push(diffItem);
      } // for (let i = 0; i < _local_list.value.length; i++) {
    }

    // 循环一下，看看哪些需要从远程删除
    if (remoteList.value) {
      for (let i = 0; i < remoteList.value.length; i++) {
        let remote = remoteList.value[i];
        let id = getRowId(remote, i);
        let local = localMap.get(id);
        if (!local) {
          re.push({
            index: -1,
            id,
            existsInRemote: true,
            existsInLocal: false,
            local: {},
            delta: {},
            remote: _.cloneDeep(remote),
          });
        }
      }
    }

    return re;
  }
  //---------------------------------------------
  // 输出特性
  //---------------------------------------------
  return {
    localList: _local_list,
    //.....................
    existsInRemote,
    getRowId,
    getRowIndex,
    getNextRowId,
    //.....................
    reset() {
      _local_list.value = undefined;
    },
    //.....................
    initLocalList,
    //.....................
    isChanged,
    hasLocalList,
    //.....................
    updateListField,
    appendToList,
    append,
    prependToList,
    prepend,
    updateItem,
    batchUpdate,
    batchUpdateBy,
    findAndUpdate,
    removeLocalItems,
    clearItems,
    //.....................
    makeChanges,
    makeDifferents,
    //.....................
  };
}
