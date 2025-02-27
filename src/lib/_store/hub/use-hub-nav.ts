import { Util } from '@site0/tijs';
import _ from 'lodash';
import { Router } from 'vue-router';
import { GlobalStatus } from '../../_features';
import { UserSessionApi } from '../use-session.store';

export type HubNav = ReturnType<typeof useHubNav>;

export function useHubNav(
  api: any,
  _global: GlobalStatus,
  _router: Router,
  session: UserSessionApi
) {
  //---------------------------------------------
  function nav_into(dirName: string) {
    let path = _global.appPath
      ? Util.appendPath(_global.appPath, dirName)
      : dirName;
    _router.push(path);
  }
  //---------------------------------------------
  /**
   * 全局路径为 /a/b 时，执行本函数，将会导航到 /a
   * 如果路径为 /a 时，执行本函数将不会有任何效果
   */
  function nav_out(by: 'api' | 'router' = 'router') {
    // 如果全局路径为空，则直接返回
    if (!_global.appPath) return;
    // 按斜杠分割路径，并过滤掉空字符串
    const segments = _global.appPath.split('/').filter(Boolean);
    // 如果路径只有一个段，说明已经在根目录，无需导航
    if (segments.length <= 1) return;
    // 移除最后一个段，导航到上一级目录
    segments.pop();
    // 重新构建路径，并确保路径以斜杠开头
    const newPath = segments.join('/');
    // 使用 router 导航到新路径
    if ('router' === by) {
      _router.push(`/${newPath}`);
    }
    // 直接采用 api 导航到新路径
    else if (_.isFunction(api.openDir)) {
      let objPath = session.getObjPath(newPath);
      api.openDir(objPath);
    }
    // 警告
    else {
      console.warn('navOut: api.openDir without defined');
    }
  }

  /**
   * 从全局 _global.appPath 为起点，导航到 /open/{appPath}/{objName} 路径
   * @param objName 对象名
   */
  function nav_open(objName: string) {
    let basePath = _global.appPath
      ? Util.appendPath('/open', _global.appPath)
      : '/open';
    let path = Util.appendPath(basePath, objName);
    _router.push(path);
  }

  return {
    nav_into,
    nav_out,
    nav_open,
  };
}
