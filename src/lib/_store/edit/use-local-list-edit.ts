import { SqlResult } from '@site0/ti-walnut';
import {
  FieldChange,
  TableRowChanagePayload,
  Vars,
  mergeFieldChanges,
} from '@site0/tijs';
import _ from 'lodash';
import { Ref, ref } from 'vue';

export function useLocalListEdit(remoteList: Ref<SqlResult[]>) {
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
  /*---------------------------------------------
                    
                   返回特性
  
  ---------------------------------------------*/
  return {
    localList,
    isChanged,
    updateListField,
  };
}
