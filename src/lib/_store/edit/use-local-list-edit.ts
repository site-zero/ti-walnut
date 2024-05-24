import { SqlResult } from '@site0/ti-walnut';
import { TableCellChanged } from '@site0/tijs';
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
  function updateListField(payload: TableCellChanged) {
    // 自动生成 localList
    if (!localList.value) {
      localList.value = _.cloneDeep(remoteList.value);
    }

    // 确定要修改的行和字段
    let { rowIndex, name, value } = payload;
    let row = localList.value[rowIndex];

    // 字段名为 Array 要修改多个键
    if (_.isArray(name)) {
      for (let key of name) {
        let val = _.get(value, key);
        row[key] = val;
      }
    }
    // 简单字段名
    else {
      row[name] = value;
    }
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
