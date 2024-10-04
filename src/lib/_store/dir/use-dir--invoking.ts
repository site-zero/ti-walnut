import { Util } from '@site0/tijs';
import _ from 'lodash';
import { DirStore, DirInvokingFeature, WnObj } from '../../../..';

export function userDirInvoking(DIR: DirStore): DirInvokingFeature {
  return async (methodName: string, payload?: any): Promise<any> => {
    let invokeName = _.camelCase(methodName);
    let method = DIR.methods.value[invokeName];
    if (method) {
      // 异步调用
      if (Util.isAsyncFunc(method)) {
        let re = await method.apply(DIR, [payload]);
        return re;
      }
      // 同步调用
      let re = method.apply(DIR, payload);
      return re;
    }
    // 警告一下
    else {
      console.warn(
        `Fail to found method [${methodName}] with payload`,
        payload
      );
    }
  };
}
