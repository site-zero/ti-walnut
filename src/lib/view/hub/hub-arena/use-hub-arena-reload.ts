import { createObjViewOptions, Walnut } from '../../../../core';
import { HubView } from '../../../../lib';
import { WnHubArenaProps } from './wn-hub-arena-types';

/**
 * 对于 Arena 区域，我们的主逻辑是采用 `@site0/ti-walnut#use-hub-view`
 * 这个高级模型，这个模型需要下面的输入信息：
 *
 * 1. viewMode : 'desktop | pad | phone'
 * 2. options : HubViewOptions
 *    # 选择数据模型
 *      - model
 *      - modelOptions
 *    # 定义界面: 布局以及每个布局块细节
 *      - actions
 *      - layout
 *      - schema
 *    # 更多自定义行为
 *      - methods
 *
 * 我们需要根据输入的 `props.dirName` 和 `props.objId` 准备上面的信息，
 * 我们采用的策略是：
 *
 * 1. 如果 server.config#views 定义 dirName 对应的视图定义文件
 * 2. 如果 dirName 不是一个视图文件路径，而是
 *
 *
 *
 * @param _props
 */
export function useHubArenaReload(props: WnHubArenaProps, _hub_view: HubView) {
  const session = _hub_view.session;
  /**
   * 重新加载视图的异步函数。
   *
   * @async
   * @function reload
   * @returns {Promise<void>} 无返回值。
   *
   * @description
   * 该函数从 `props` 中获取 `dirName` 和 `objId`，然后使用 `Walnut.loadHubViewOptions`
   * 异步加载视图设置。加载完成后，使用 `useHubView` 重新加载视图并更新 `_view.value`。
   */
  async function reload() {
    let { hubPath, hashId } = props;
    try {
      _hub_view.setLoading(true);
      let path = session.getObjPath(hubPath);
      let obj = await Walnut.fetchObj(path);
      // 未找到对象，那么肯定是不能接受的
      if (!obj) {
        return;
      }

      // 获取视图设置
      let viewOptions = await Walnut.loadHubViewOptions(hubPath, obj);
      // 尝试根据对象的信息加载
      if (!viewOptions) {
        viewOptions = await createObjViewOptions(obj);
      }
      // 重新加载视图
      await _hub_view.reload(obj, viewOptions, hashId);
    }
    // 捕获错误
    catch (err) {
      console.error(err);
    }
    // 总之要关闭加载状态
    finally {
      _hub_view.setLoading(false);
    }
  }

  //---------------------------------------------
  // 输出特性
  //---------------------------------------------
  return reload;
}
