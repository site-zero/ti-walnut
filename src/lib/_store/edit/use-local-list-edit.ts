import { SqlExecOptions, SqlExecSetVar, SqlResult } from '@site0/ti-walnut';
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
  remoteList: Ref<SqlResult[]>,
  options: LocalListEditOptions = {}
) {
  let {
    isNew = (meta: SqlResult) => 'new' == meta.id || _.isNil(meta.id),
    idKey = 'id',
    getId,
  } = options;

  const getMetaId =
    getId ?? ((meta: SqlResult) => _.get(meta, idKey) as string);

  /*---------------------------------------------
                    
                 数据模型
  
  ---------------------------------------------*/
  let localList = ref<SqlResult[]>();

  /*---------------------------------------------
                    
                   方法
  
  ---------------------------------------------*/
  function isChanged() {
    if (localList.value) {
      return !_.isEqual(remoteList.value, localList.value);
    }
    return false;
  }

  /**
   * 更新一条记录的某个字段
   *
   * @param payload Shipment 单元格改动
   */
  function updateListField(payload: TableRowChanagePayload) {
    // 自动生成 localList
    if (!localList.value) {
      localList.value = _.cloneDeep(remoteList.value);
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
      localList.value = _.cloneDeep(remoteList.value);
    }

    localList.value.push(newItem);
  }

  function makeChanges(options: LocalListMakeChangeOptions) {
    let changes = [] as SqlExecOptions[];
    // 对远程列表编制索引
    let remoteMap = new Map<string, SqlResult>();
    for (let remote of remoteList.value) {
      let id = getMetaId(remote);
      remoteMap.set(id, remote);
    }

    // 准备两个列表
    let insertList = [] as Vars[];
    let updateList = [] as Vars[];

    // 循环本地列表
    if (localList.value) {
      for (let local of localList.value) {
        let id = getMetaId(local);
        let remote = remoteMap.get(id);
        // 已经存在
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
        // 必然是新记录
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
        sets: options.insertSet,
      });
    }

    // 对更新，生成配置
    for (let vars of updateList) {
      changes.push({
        sql: options.updateSql,
        vars,
        explain: true,
      });
    }

    return changes;
  }
  /*---------------------------------------------
                    
                   返回特性
  
  ---------------------------------------------*/
  return {
    localList,
    isChanged,
    updateListField,
    appendToList,
    makeChanges,
  };
}

export type LocalListMakeChangeOptions = {
  defaultMeta?: Vars;
  updateSql: string;
  insertSql: string;
  insertMeta?: Vars;
  insertSet?: SqlExecSetVar[];
  updateMeta?: Vars;
  //fetchBack?: [string, (Vars | undefined)?];
};
