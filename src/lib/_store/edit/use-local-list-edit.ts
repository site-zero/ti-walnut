import { SqlResult } from '@site0/ti-walnut';
import { Ref, ref } from 'vue';
import _ from 'lodash';
import { CellChanged } from '@site0/tijs';

export function useLocalListEdit(remoteList: Ref<SqlResult[]>) {
  /*---------------------------------------------
                    
                 数据模型
  
  ---------------------------------------------*/
  let localList = ref<SqlResult[]>();

  /*---------------------------------------------
                    
                   方法
  
  ---------------------------------------------*/
  function isChanged() {
    return localList.value ? true : false;
  }
  /**
   * 更新一条记录的某个字段
   *
   * @param payload Shipment 单元格改动
   */
  function updateListField(payload: CellChanged) {
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
