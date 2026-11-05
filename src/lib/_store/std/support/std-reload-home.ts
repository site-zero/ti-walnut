import { KeepInfo, Util, Vars } from "@site0/tijs";
import { isWnObj, SqlQuery, WnObj } from "@site0/ti-walnut";
import _ from "lodash";
import { auto_create_obj } from "./auto-create-home";

/**
 * 选区信息
 */
export type HomeSelection = {
  currentId?: string;
  checkedIds?: string[];
};

/**
 * 重新加载主目录所需的配置与回调
 */
export type ReloadHomeSetup = {
  /**
   * 主目录路径，通常就是一个文件夹，如果是 thing 文件夹，
   * 那么，除了这个参数，还需要声明 indexPath='index'
   */
  homePath: string | WnObj | (() => string | WnObj);
  /**
   * 数据对象存储的位置，如果未指定，则采用与 homePath 相同的路径
   */
  indexPath?: string;
  /**
   * 指定一个本数据集，专有的数据附件存储目录
   */
  dataPath?: string;
  /**
   * 如果指定了这个选项，当 homePath 不存在的时候，就自动创建它
   */
  autoCreateHome?: boolean;
  /**
   * 本地状态保持的配置
   */
  keepQuery?: KeepInfo;
  keepSelect?: KeepInfo;

  /**
   * 按路径读取对象
   */
  fetch: (path: string) => Promise<WnObj | undefined>;
  /**
   * 按 ID 读取对象
   */
  getObj: (id: string) => Promise<WnObj | undefined>;

  /**
   * 设置主目录对象
   */
  setHome: (obj: WnObj) => void;
  /**
   * 设置索引目录对象
   */
  setIndexDir: (obj: WnObj | undefined) => void;
  /**
   * 设置数据目录对象
   */
  setDataDir: (obj: WnObj | undefined) => void;
  /**
   * 设置本地查询条件保持的配置
   */
  setKeepQuery: (keep: KeepInfo | undefined) => void;
  /**
   * 设置本地选区保持的配置
   */
  setKeepSelect: (keep: KeepInfo | undefined) => void;

  /**
   * 重新生成查询条件
   */
  createQuery: () => SqlQuery;
  /**
   * 设置查询条件
   */
  setQuery: (q: SqlQuery) => void;

  /**
   * 读取上次保存的选区
   */
  loadSelection: () => HomeSelection | Vars | null | undefined;
  /**
   * 设置当前选区
   */
  setSelection: (currentId?: string, checkedIds?: string[]) => void;
};

/**
 * 重新加载主目录数据。
 *
 * 该函数首先从指定路径读取主目录对象，如果对象不存在且允许自动创建，则会自动创建该对象。
 * 然后初始化索引路径和数据路径，并通过回调将结果注入调用方。
 *
 * @throws 如果 homePath 未找到。
 */
export async function std_reload_home(setup: ReloadHomeSetup): Promise<void> {
  let { homePath, autoCreateHome, indexPath, dataPath } = setup;

  let home: string | WnObj;
  if (_.isFunction(homePath)) {
    home = homePath();
  } else {
    home = homePath;
  }

  // 读取 home Obj
  let oHome: WnObj | undefined = undefined;
  if (isWnObj(home)) {
    oHome = home;
  } else {
    oHome = await setup.fetch(home);
  }

  // 防空:自动创建
  if (!oHome) {
    if (autoCreateHome && _.isString(homePath)) {
      oHome = await auto_create_obj(homePath);
    }
  }
  // 再次防空
  if (!oHome) {
    throw `homePath not found: ${homePath}`;
  }

  // 如果是个文件，就优先高亮这个文件
  let fileObjId: string | undefined = undefined;
  if ("FILE" == oHome.race) {
    fileObjId = oHome.id;
    oHome = await setup.getObj(oHome.pid);
  }
  // 再再次防空
  if (!oHome) {
    throw `homePath not found: ${homePath}`;
  }

  // 已经确保了 home obj 是个目录
  setup.setHome(oHome);

  // init index path
  if (indexPath) {
    let aph = Util.appendPath(`id:${oHome.id}`, indexPath);
    setup.setIndexDir(await setup.fetch(aph));
  } else {
    setup.setIndexDir(oHome);
  }

  // init data path
  if (dataPath) {
    let aph = Util.appendPath(`id:${oHome.id}`, dataPath);
    setup.setDataDir(await setup.fetch(aph));
  }

  // 根据 home 重新评估一下 options
  let exCtx = { HomeId: oHome.id, HomeObj: oHome };
  setup.setKeepQuery(Util.explainObj(exCtx, setup.keepQuery));
  setup.setKeepSelect(Util.explainObj(exCtx, setup.keepSelect));

  // 重新加载查询条件
  setup.setQuery(setup.createQuery());

  // 恢复选区: 直接指定的
  if (fileObjId) {
    setup.setSelection(fileObjId, [fileObjId]);
  }
  // 恢复选区: 上次选中的
  else {
    let selection = setup.loadSelection() ?? {};
    setup.setSelection(selection.currentId, selection.checkedIds || []);
  }
}
