import {
  LocalMetaMakeChangeOptions,
  SqlExecOptions,
  SqlResult,
} from '@site0/ti-walnut';
import {
  TableRowChanagePayload,
  TableRowID,
  Util,
  Vars,
  useFieldChangeDiff,
} from '@site0/tijs';
import _ from 'lodash';
import { Ref, ref } from 'vue';

export type LocalListEditOptions = {
  // /**
  //  *  判断一个对象是否为新对象
  //  */
  // isNew?: (meta: SqlResult) => boolean;
  // /**
  //  * 在 makeChange 的时候，会用到，如果指定 null 则不自动添加 update id
  //  */
  // idKey?: string;

  patchMetaUpdate?:
    | null
    | ((diff: Vars, id: TableRowID, remote: SqlResult) => void);
  /**
   * 从指定的对象获取 ID
   *
   * - `string` : 表示一个数据键，将通过 `_.get` 获取值，这个值必须是 `T`
   *              或者可以被 `anyConvertor` 转换的值
   * - `Function` : 一个获取 ID 的函数
   */
  getId?: string | ((it: SqlResult, index: number) => TableRowID);
};

export type LocalListMakeChangeOptions = LocalMetaMakeChangeOptions & {
  deleteSql?: string;
};

export function useLocalListEdit(
  remoteList: Ref<SqlResult[] | undefined>,
  options: LocalListEditOptions = {}
) {
  let { getId = 'id' } = options;
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  let _local_list = ref<SqlResult[] | undefined>();
  //---------------------------------------------
  //                 被内部重用的方法
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

  /*---------------------------------------------
                    
                  输出特性
  
  ---------------------------------------------*/
  return {
    localList: _local_list,
    //.............................................
    getRowId,
    //.............................................
    reset() {
      _local_list.value = undefined;
    },
    //.............................................
    initLocalList() {
      if (!_local_list.value) {
        _local_list.value = _.cloneDeep(remoteList.value || []);
        return true;
      }
      return false;
    },
    //.............................................
    isChanged() {
      if (_local_list.value) {
        return !_.isEqual(remoteList.value, _local_list.value);
      }
      return false;
    },
    //.............................................
    hasLocalList() {
      return _local_list.value ? true : false;
    },
    //.............................................
    updateListField(payload: TableRowChanagePayload) {
      // 自动生成 localList
      if (!_local_list.value) {
        _local_list.value = _.cloneDeep(remoteList.value || []);
      }

      // 确定要修改的行和字段
      let { rowIndex, changed } = payload;
      let row = _local_list.value[rowIndex];

      // 应用修改修改详情列表
      useFieldChangeDiff(changed, row);
    },
    //.............................................
    appendToList(newItem: SqlResult) {
      // 自动生成 localList
      if (!_local_list.value) {
        _local_list.value = _.cloneDeep(remoteList.value || []);
      }

      _local_list.value.push(newItem);
    },
    //.............................................
    batchUpdate(meta: Vars, forIds?: TableRowID | TableRowID[]) {
      // 自动生成 localList
      if (!_local_list.value) {
        _local_list.value = _.cloneDeep(remoteList.value || []);
      }
      console.log('batchUpdate', forIds, meta);

      // 全部记录
      if (_.isNil(forIds)) {
        for (let i = 0; i < _local_list.value.length; i++) {
          let local = _local_list.value[i];
          _.assign(local, meta);
        }
      }
      // 某条指定记录
      else if (_.isString(forIds)) {
        for (let i = 0; i < _local_list.value.length; i++) {
          let local = _local_list.value[i];
          let id = getRowId(local, i);
          if (forIds == id) {
            _.assign(local, meta);
          }
        }
      }
      // 一批记录
      else if (_.isArray(forIds)) {
        if (forIds.length > 0) {
          let ids = Util.arrayToMap(forIds);
          for (let i = 0; i < _local_list.value.length; i++) {
            let local = _local_list.value[i];
            let id = getRowId(local, i);
            if (ids.get(id)) {
              _.assign(local, meta);
            }
          }
        }
      }
    },
    //.............................................
    removeLocalItems(forIds?: TableRowID[]) {
      // Guard
      if (!forIds || _.isEmpty(forIds)) {
        return;
      }

      // 自动生成 localList
      if (!_local_list.value) {
        _local_list.value = _.cloneDeep(remoteList.value || []);
      }

      // Remove Local list
      let ids = Util.arrayToMap(forIds);
      let list = [] as SqlResult[];
      if (_local_list.value) {
        for (let i = 0; i < _local_list.value.length; i++) {
          let local = _local_list.value[i];
          let id = getRowId(local, i);
          if (!ids.get(id)) {
            list.push(local);
          }
        }
      }
      _local_list.value = list;
    },
    //.............................................
    makeChanges(options: LocalListMakeChangeOptions) {
      let changes = [] as SqlExecOptions[];
      // 对远程列表编制索引
      let remoteMap = new Map<TableRowID, SqlResult>();
      if (remoteList.value) {
        for (let i = 0; i < remoteList.value.length; i++) {
          let remote = remoteList.value[i];
          let id = getRowId(remote, i);
          remoteMap.set(id, remote);
        }
      }

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
            // 补上 ID
            if (patchMetaUpdate) {
              patchMetaUpdate(diff, id, remote);
            }
            // 补上固定 Meta
            _.assign(diff, options.defaultMeta);
            _.assign(diff, options.updateMeta);

            // 记入列表
            updateList.push(diff);
          }
          // 必然是新记录，需要插入
          else {
            let newMeta = _.cloneDeep(local);
            _.assign(newMeta, options.defaultMeta);
            _.assign(newMeta, options.insertMeta);
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
      for (let vars of insertList) {
        changes.push({
          sql: options.insertSql,
          vars,
          explain: true,
          reset: true,
          noresult: options.noresult,
          sets: options.insertSet,
        });
      }

      // 对更新，生成配置
      for (let vars of updateList) {
        changes.push({
          sql: options.updateSql,
          vars,
          explain: true,
          reset: true,
          noresult: options.noresult,
        });
      }

      

      return changes;
    },
    //.............................................
  };
}
