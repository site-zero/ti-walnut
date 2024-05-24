import { SqlResult } from '@site0/ti-walnut';
import { Vars } from '@site0/tijs';
import _ from 'lodash';
import { Ref, ref } from 'vue';

export function useLocalMetaEdit(remoteMeta: Ref<SqlResult>) {
  /*---------------------------------------------
                    
                 数据模型
  
  ---------------------------------------------*/
  let localMeta = ref<SqlResult>();

  /*---------------------------------------------
                    
                   方法
  
  ---------------------------------------------*/
  function isChanged() {
    if (localMeta.value) {
      return !_.isEqual(remoteMeta.value, localMeta.value);
    }
    return false;
  }
  /**
   * 更新一条记录的某个字段
   *
   * @param payload Shipment 单元格改动
   */
  function updateMeta(change: Vars) {
    // 自动生成 localMeta
    if (!localMeta.value) {
      localMeta.value = _.cloneDeep(remoteMeta.value);
    }

    // 更新一下
    _.assign(localMeta.value, change);
  }
  /*---------------------------------------------
                    
                   返回特性
  
  ---------------------------------------------*/
  return {
    localMeta: localMeta,
    isChanged,
    updateMeta,
  };
}
