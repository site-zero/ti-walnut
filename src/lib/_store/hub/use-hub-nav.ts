import { Alert, Be, ListProps, openAppModal, Util } from "@site0/tijs";
import { Router } from "vue-router";
import { GlobalStatusApi } from "../../_features";
import { WnObj } from "../../../_types";
import { Walnut } from "../../../core";
import _ from "lodash";

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
  function nav_open(obj: WnObj, appName?: string) {
    // 防空
    if (!obj) return;

    // 选择默认应用
    if (!appName) {
      let app = Walnut.getObjDefaultApplication(obj);
      if (!app) {
        Alert(
          `Fail to get default application of object: ${JSON.stringify(obj)}`,
          { type: "warn" }
        );
        return;
      }
      appName = app.value;
    }

    let newPath = `/a/open/${appName}`;
    let appUrl = Walnut.getUrl(newPath);
    // 使用 router 导航到新路径
    Be.OpenUrl(appUrl, {
      params: {
        id: obj.id,
      },
    });
  }

  async function nav_open_with(obj: WnObj) {
    console.log("nav_open_with", obj);
    // 防空
    if (!obj) return;

    // 获取应用列表
    let apps = Walnut.getObjApplications(obj);

    if (_.isEmpty(apps)) {
      await Alert(`没有适用于对象 [${obj.nm}] 的应用`, { type: "info" });
    }

    // 第一个作为默认应用
    let dftAppName = _.first(apps)?.value;

    // 让用户选择应用
    let appName = await openAppModal({
      title: "i18n:select",
      type: "primary",
      position: "top",
      width: "480px",
      height: "90%",
      maxHeight: "960px",
      result: dftAppName,
      model: { event: "select.currentId", data: "currentId" },
      comType: "TiList",
      comConf: {
        multi: false,
        data: apps,
      } as ListProps,
    });
    //console.log("nav_open_with", appName);

    // 用户取消
    if (!appName) return;

    // 打开应用
    nav_open(obj, appName);
  }

  return {
    nav_into,
    nav_out,
    nav_open,
    nav_open_with,
    set_hash,
  };
}
