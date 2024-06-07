import {
  LocalMetaMakeChangeOptions,
  SqlExecOptions,
  SqlResult,
} from '@site0/ti-walnut';
import {
  FieldChange,
  TableRowChanagePayload,
  Util,
  Vars,
  mergeFieldChanges,
} from '@site0/tijs';
import _ from 'lodash';
import { Ref, ref } from 'vue';

export type LocalListEditOptions = {
  isNew?: (meta: SqlResult) => boolean;
  idKey?: string;
  getId?: (meta: SqlResult) => string;
};

export function useLocalListEdit(
  remoteList: Ref<SqlResult[] | undefined>,
  options: LocalListEditOptions = {}
) {
  let {
    //isNew = (meta: SqlResult) => 'new' == meta.id || _.isNil(meta.id),
    idKey = 'id',
    getId,
  } = options;

  const getMetaId =
    getId ?? ((meta: SqlResult) => _.get(meta, idKey) as string);

  /*---------------------------------------------
                    
                 数据模型
  
  ---------------------------------------------*/
  let localList = ref<SqlResult[] | undefined>();

  /*---------------------------------------------
                    
                   方法
  
  ---------------------------------------------*/
  function initLocalList() {
    if (!localList.value) {
      localList.value = _.cloneDeep(remoteList.value || []);
      return true;
    }
    return false;
  }

  function isChanged() {
    if (localList.value) {
      return !_.isEqual(remoteList.value, localList.value);
    }
    return false;
  }

  function hasLocalList() {
    return localList.value ? true : false;
  }

  /**
   * 更新一条记录的某个字段
   *
   * @param payload Shipment 单元格改动
   */
  function updateListField(payload: TableRowChanagePayload) {
    // 自动生成 localList
    if (!localList.value) {
      localList.value = _.cloneDeep(remoteList.value || []);
    }

    // 确定要修改的行和字段
    let { rowIndex, changed } = payload;
    let row = localList.value[rowIndex];

    // 内容为修改详情列表
    let diff: Vars;
    if (_.isArray<FieldChange>(changed)) {
      diff = mergeFieldChanges(changed);
    }
    // 已经合并过了
    else {
      diff = changed;
    }

    // 合并
    _.assign(row, changed);
  }

  function appendToList(newItem: SqlResult) {
    // 自动生成 localList
    if (!localList.value) {
      localList.value = _.cloneDeep(remoteList.value || []);
    }

    localList.value.push(newItem);
  }

  function batchUpdate(meta: Vars, forIds?: string | string[]) {
    // 自动生成 localList
    if (!localList.value) {
      localList.value = _.cloneDeep(remoteList.value || []);
    }
    console.log('batchUpdate', forIds, meta);

    // 全部记录
    if (_.isNil(forIds)) {
      for (let local of localList.value) {
        _.assign(local, meta);
      }
    }
    // 某条指定记录
    else if (_.isString(forIds)) {
      for (let local of localList.value) {
        let id = getMetaId(local);
        if (forIds == id) {
          _.assign(local, meta);
        }
      }
    }
    // 一批记录
    else if (_.isArray(forIds)) {
      if (forIds.length > 0) {
        let ids = Util.arrayToMap(forIds);
        for (let local of localList.value) {
          let id = getMetaId(local);
          if (ids.get(id)) {
            _.assign(local, meta);
          }
        }
      }
    }
  }

  function removeLocalItems(forIds?: string[]) {
    // Guard
    if (!forIds || _.isEmpty(forIds)) {
      return;
    }

    // 自动生成 localList
    if (!localList.value) {
      localList.value = _.cloneDeep(remoteList.value || []);
    }

    // Remove Local list
    let ids = Util.arrayToMap(forIds);
    let list = [] as SqlResult[];
    if (localList.value) {
      for (let local of localList.value) {
        let id = getMetaId(local);
        if (!ids.get(id)) {
          list.push(local);
        }
      }
    }
    localList.value = list;
  }

  function makeChanges(options: LocalListMakeChangeOptions) {
    let changes = [] as SqlExecOptions[];
    // 对远程列表编制索引
    let remoteMap = new Map<string, SqlResult>();
    if (remoteList.value) {
      for (let remote of remoteList.value) {
        let id = getMetaId(remote);
        remoteMap.set(id, remote);
      }
    }

    // 准备两个列表
    let insertList = [] as Vars[];
    let updateList = [] as Vars[];

    // 循环本地列表
    if (localList.value) {
      for (let local of localList.value) {
        let id = getMetaId(local);
        let remote = remoteMap.get(id);
        // 已经存在，必然是要更新记录
        if (remote) {
          let diff = Util.getDiff(remote, local, {
            checkRemoveFromOrgin: true,
          });
          if (_.isEmpty(diff)) {
            continue;
          }
          // 补上 ID
          diff[idKey] = id;
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
  }
  /*---------------------------------------------
                    
                   返回特性
  
  ---------------------------------------------*/
  return {
    localList,
    initLocalList,
    isChanged,
    hasLocalList,
    updateListField,
    appendToList,
    makeChanges,
    batchUpdate,
    removeLocalItems,
  };
}

export type LocalListMakeChangeOptions = LocalMetaMakeChangeOptions;
