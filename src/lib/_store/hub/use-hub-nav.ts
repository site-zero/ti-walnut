import { Alert, Be, Util } from "@site0/tijs";
import { Router } from "vue-router";
import { GlobalStatusApi } from "../../_features";
import { WnObj } from "../../../_types";
import { Walnut } from "../../../core";

export type HubNav = ReturnType<typeof useHubNav>;

export function useHubNav(_gl_sta: GlobalStatusApi, _router: Router) {
  //---------------------------------------------
  function set_hash(hash?: string | null) {
    if (hash && !/^#/.test(hash)) {
      hash = "#" + hash;
    }
    let newPath = _gl_sta.data.appPath + (hash || "");
    // 变成URL绝对path
    newPath = _gl_sta.getPathOfApp(newPath);
    _router.push(newPath);
  }
  //---------------------------------------------
  function nav_into(dirName: string) {
    let newPath = _gl_sta.data.appPath
      ? Util.appendPath(_gl_sta.data.appPath, dirName)
      : dirName;
    // 变成URL绝对path
    newPath = _gl_sta.getPathOfApp(newPath);
    _gl_sta.setAppPath(newPath);
    _router.push(newPath);
  }
  //---------------------------------------------
  /**
   * 全局路径为 /a/b 时，执行本函数，将会导航到 /a
   * 如果路径为 /a 时，执行本函数将不会有任何效果
   */
  function nav_out() {
    // 如果全局路径为空，则直接返回
    if (!_gl_sta.data.appPath) return;
    // 按斜杠分割路径，并过滤掉空字符串
    const segments = _gl_sta.data.appPath.split("/").filter(Boolean);
    // 如果路径只有一个段，说明已经在根目录，无需导航
    if (segments.length <= 1) return;
    // 移除最后一个段，导航到上一级目录
    segments.pop();
    // 变成URL绝对path
    let newPath = _gl_sta.getPathOfApp(`/${segments.join("/")}`);
    // 使用 router 导航到新路径
    _gl_sta.setAppPath(newPath);
    _router.push(newPath);
  }

  /**
   * 从全局 _global.appPath 为起点，导航到 /open/{appPath}/{objName} 路径
   * @param obj 对象
   */
  function nav_open(obj: WnObj) {
    let app = Walnut.getObjDefaultApplication(obj);
    if (!app) {
      Alert(
        `Fail to get default application of object: ${JSON.stringify(obj)}`,
        { type: "warn" }
      );
      return;
    }

    let newPath = `/a/open/${app.value}`;
    // 使用 router 导航到新路径
    Be.OpenUrl(newPath, {
      params: {
        id: obj.id,
      },
    });
  }

  return {
    nav_into,
    nav_out,
    nav_open,
    set_hash,
  };
}
