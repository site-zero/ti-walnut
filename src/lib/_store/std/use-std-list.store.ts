import {
  ComboFilterValue,
  KeepInfo,
  Match,
  TableSelectEmitInfo,
  useKeep,
  Util,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { computed, reactive, ref } from 'vue';
import {
  DataStoreActionStatus,
  DataStoreLoadStatus,
  ListItemUpdateOptions,
  LocalListEditOptions,
  QueryFilter,
  QuerySorter,
  SqlPagerInput,
  SqlQuery,
  updatelPager,
  updatePagerTotal,
  useLocalListEdit,
  useWnObj,
  WnObj,
  WnObjQueryOptions,
} from '../../';
import { ObjContentFinger, useObjContentStore } from '../use-obj-content.store';
import { auto_create_obj } from './support/auto-create-home';

export type StdListStore = ReturnType<typeof defineStdListStore>;

export type StdListStoreOptions = LocalListEditOptions & {
  /**
   * 主目录路径，通常就是一个文件夹，如果是 thing 文件夹，
   * 那么，除了生米这个参数，还需要声明 indexPath='index'
   */
  homePath: string;
  /**
   * 数据对象存储的位置，如果未指定，则采用与 homePath 相同的路径
   */
  indexPath?: string;
  /**
   * 指定一个本数据集，专有的数据附件存储目录
   * 如果指定了，那么会根据这个路径也暴露出一个 `StdListStore`
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
   * 固定过滤条件
   */
  fixedMatch?: QueryFilter | (() => QueryFilter);
  /**
   * 默认查询条件
   */
  query?: SqlQuery | (() => SqlQuery);
  /**
   * 保存后自动刷新结果
   */
  refreshWhenSave?: boolean;
  /**
   * 读取 remote 列表后，固定的修改补充信息逻辑
   *
   * @param remote 远端查询结果对象
   * @param index 数据下标 (0 base)
   * @returns
   */
  patchRemote?: (remote: WnObj, index: number) => WnObj;
};

function defineStdListStore(options?: StdListStoreOptions) {
  //---------------------------------------------
  // 准备数据访问模型
  let _options: StdListStoreOptions = _.cloneDeep(options ?? { homePath: '~' });
  const _obj = useWnObj();
  const _home_obj = ref<WnObj>();
  const _dir_index = ref<WnObj>();
  const _dir_data = ref<WnObj>();
  //---------------------------------------------
  // 本地状态数据
  const _keep_query = computed(() => useKeep(_options.keepQuery));
  const _keep_select = computed(() => useKeep(_options.keepSelect));
  /**
   * 开启这个选项，如果选择的当前对象是一个文件，那么就自动加载内容
   */
  const _auto_load_content = ref<boolean>(false);
  //---------------------------------------------
  //              固定查询条件
  //---------------------------------------------
  function __create_fixed_match(): QueryFilter {
    if (_.isFunction(_options.fixedMatch)) {
      return _options.fixedMatch();
    }
    if (_options.fixedMatch) {
      return _.cloneDeep(_options.fixedMatch);
    }
    return {};
  }
  //---------------------------------------------
  //              默认查询条件
  //---------------------------------------------
  function __create_data_query(): SqlQuery {
    let re: SqlQuery = {
      filter: {},
      sorter: {},
      pager: { pageNumber: 1, pageSize: 50 },
    };
    if (_.isFunction(_options.query)) {
      let q = _options.query();
      _.assign(re, q);
    } else {
      _.assign(re, _options.query);
    }
    // 最后处理一下本地数据
    let local = _keep_query.value.loadObj();
    _.merge(re, local);
    // 搞定
    return re;
  }
  //---------------------------------------------
  //                 建立数据模型
  //---------------------------------------------
  const _remote = ref<WnObj[]>();
  const _action_status = ref<DataStoreActionStatus>();
  const query = reactive(__create_data_query());
  const _current_id = ref<string>();
  const _checked_ids = ref<string[]>([]);
  const _content = useObjContentStore();
  //---------------------------------------------
  let selection = _keep_select.value.loadObj() ?? {};
  _current_id.value = selection.currentId;
  _checked_ids.value = selection.checkedIds || [];
  //---------------------------------------------
  function __save_local_query() {
    _keep_query.value.save({
      filter: query.filter,
      sorter: query.sorter,
      pager: {
        pageSize: query.pager?.pageSize,
      },
    });
  }
  //---------------------------------------------
  function __reset_local_query() {
    _keep_query.value.reset();
  }
  //---------------------------------------------
  function __save_local_select() {
    _keep_select.value.save({
      currentId: _current_id.value,
      checkedIds: _checked_ids.value,
    });
  }
  //---------------------------------------------
  function __reset_local_select() {
    _keep_select.value.reset();
  }
  //---------------------------------------------
  //                 组合其他特性
  //---------------------------------------------
  const _local = computed(() => useLocalListEdit(_remote, _options));
  //---------------------------------------------
  const ActionStatus = computed(() => _action_status.value);
  //---------------------------------------------
  const LoadStatus = computed((): DataStoreLoadStatus => {
    if (_.isUndefined(_remote.value)) {
      return 'unloaded';
    }
    if (_remote.value.length == query.pager?.totalCount) {
      return 'full';
    }
    return 'partial';
  });

  //---------------------------------------------
  // 读写内容
  //---------------------------------------------
  function getCurrentContentFinger(): ObjContentFinger | undefined {
    // 防空
    if (!CurrentItem.value) {
      return;
    }

    // 读取指纹
    let { id, len, sha1, mime, tp } = CurrentItem.value;
    return { id, len, sha1, mime, tp };
  }

  /**
   * 加载当前内容。
   *
   * 该函数首先检查 `CurrentItem.value` 是否存在，如果不存在则直接返回。
   * 如果存在，则将 `_action_status.value` 设置为 'loading'，然后根据 `_current_id.value` 加载内容并赋值给 `_content.value`。
   * 最后将 `_action_status.value` 置为 undefined。
   *
   * @returns {Promise<void>} 一个表示异步操作的 Promise 对象。
   */
  async function loadCurrentContent() {
    // 读取指纹
    let finger = getCurrentContentFinger();

    // 防空
    if (!finger) {
      return;
    }

    // 读取内容
    _action_status.value = 'loading';
    await _content.loadContent(finger);
    _action_status.value = undefined;
  }

  /**
   * 设置当前内容。
   *
   * @param content - 要设置的内容字符串。
   *
   * 如果 `CurrentItem.value` 为空，则不会设置内容。
   */
  function setCurrentContent(content: string) {
    // 防空
    if (!CurrentItem.value) {
      return;
    }
    _content.setContent(content);
  }

  /**
   * 保存当前内容。
   *
   * 如果当前项为空，则直接返回。
   * 否则，将当前内容保存到指定对象中，并更新操作状态。
   *
   * @async
   * @function
   * @returns {Promise<void>} 无返回值
   */
  async function saveCurrentContent() {
    // 防空
    if (!CurrentItem.value) {
      return;
    }
    // 保存内容
    _action_status.value = 'saving';
    await _content.saveChange();
    _action_status.value = undefined;
  }
  //---------------------------------------------
  // 基础本地方法
  //---------------------------------------------
  function resetLocalChange() {
    _local.value.reset();
  }

  function clearRemoteList() {
    _remote.value = undefined;
    if (query.pager) {
      updatePagerTotal(query.pager, 0);
    }
  }

  function setOptions(opt: StdListStoreOptions) {
    _options = _.cloneDeep(opt);
  }

  function assignOptions(opt: Partial<StdListStoreOptions>) {
    _.assign(_options, opt);
  }

  async function __try_auto_load_content() {
    if (_auto_load_content.value) {
      let finger = getCurrentContentFinger();
      if (finger && !_content.isSameFinger(finger)) {
        await loadCurrentContent();
      }
    }
  }

  async function setAutoLoadContent(value: boolean) {
    _auto_load_content.value = value;
    await __try_auto_load_content();
  }

  //---------------------------------------------
  //                 被内部重用的方法
  //---------------------------------------------
  const listData = computed(() => {
    return _local.value.localList.value || _remote.value || [];
  });
  const hasCurrent = computed(() => !_.isNil(CurrentItem.value));
  const hasChecked = computed(
    () => _checked_ids.value && _checked_ids.value.length > 0
  );

  /**
   * 获取数据的 ID
   */
  function getItemId(it: WnObj, index: number): string {
    return _local.value.getRowId(it, index) as string;
  }

  function getItemById(id?: string) {
    if (_.isNil(id)) {
      return;
    }
    let index = _local.value.getRowIndex(id);
    if (index >= 0) {
      return listData.value[index];
    }
  }

  function getItemByIndex(index: number) {
    if (index >= 0 && index < listData.value.length) {
      return listData.value[index];
    }
  }

  function getItemByMatch(match: any): WnObj | undefined {
    let am = Match.parse(match, false);
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (am.test(it)) {
        return it;
      }
    }
  }

  function getItemBy(predicate: (it: WnObj, index: number) => boolean) {
    return _.find(listData.value, predicate);
  }

  function getCurrentItem(): WnObj | undefined {
    return getItemById(_current_id.value);
  }

  function findItemsById(ids: string[]): WnObj[] {
    let indexs = ids.map((id) => _local.value.getRowIndex(id));
    let re: WnObj[] = [];
    for (let i of indexs) {
      if (i >= 0) {
        let it = listData.value[i];
        re.push(it);
      }
    }
    return re;
  }

  function findItemsByMatch(match: any): WnObj[] {
    let re: WnObj[] = [];
    let am = Match.parse(match, false);
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (am.test(it)) {
        re.push(it);
      }
    }
    return re;
  }

  function findItemsBy(
    predicate: (it: WnObj, index: number) => boolean
  ): WnObj[] {
    let re: WnObj[] = [];
    for (let i = 0; i < listData.value.length; i++) {
      let it = listData.value[i];
      if (predicate(it, i)) {
        re.push(it);
      }
    }
    return re;
  }

  function updateCurrent(meta: WnObj): WnObj | undefined {
    if (hasCurrent.value) {
      let uf = { id: _current_id.value };
      return _local.value.updateItem(meta, uf);
    }
  }

  function updateItem(
    meta: Vars,
    options: ListItemUpdateOptions
  ): WnObj | undefined {
    return _local.value.updateItem(meta, options);
  }

  function updateItems(meta: WnObj, forIds?: string | string[]): WnObj[] {
    return _local.value.batchUpdate(meta, forIds);
  }

  function updateChecked(meta: WnObj): WnObj[] {
    return _local.value.batchUpdate(meta, _checked_ids.value);
  }

  function removeChecked(): WnObj[] {
    if (hasChecked.value) {
      return _local.value.removeLocalItems(_checked_ids.value);
    }
    return [];
  }

  function clear() {
    _local.value.clearItems();
  }

  function removeItems(forIds?: string | string[]): WnObj[] {
    if (!_.isNil(forIds)) {
      let ids = _.concat([], forIds);
      return _local.value.removeLocalItems(ids);
    }

    return [];
  }

  async function updateSelection(
    currentId?: string | null,
    checkedIds?: string[]
  ) {
    if (_.isEmpty(checkedIds) && !_.isNil(currentId)) {
      checkedIds = [currentId];
    }
    if (!checkedIds && currentId) {
      checkedIds = [currentId];
    }
    _current_id.value = currentId ?? undefined;
    _checked_ids.value = checkedIds ?? [];

    await __try_auto_load_content();
  }

  function cancelSelection() {
    _current_id.value = undefined;
    _checked_ids.value = [];
    __reset_local_select();
  }

  const CurrentItem = computed(() => getCurrentItem());

  function __gen_query(): SqlQuery {
    let q = _.cloneDeep(query);
    q.filter = q.filter ?? {};
    _.assign(q.filter, __create_fixed_match());
    return q;
  }

  /**
   * 异步查询远程列表并更新状态。
   *
   * @param {WnObjQueryOptions} [setup={}] - 查询选项。
   * @returns {Promise<void>} - 返回一个 Promise 对象，表示查询操作的完成。
   *
   * @remarks
   * 该函数执行以下操作：
   * 1. 设置 `_action_status` 为 'loading'。
   * 2. 生成查询条件 `q`。
   * 3. 使用 `_obj.query` 方法查询远程列表和分页信息。
   * 4. 如果 `_options.patchRemote` 存在，则对查询结果进行处理。
   * 5. 更新 `remoteList` 为查询结果。
   * 6. 如果查询包含分页信息，则更新分页信息。
   * 7. 将 `_action_status` 重置为 `undefined`。
   */
  async function queryRemoteList(setup: WnObjQueryOptions = {}): Promise<void> {
    _action_status.value = 'loading';
    // 准备查询条件
    let q = __gen_query();
    //console.log('queryRemoteList', q);
    let [list, pager] = await _obj.query(_dir_index.value ?? {}, setup, q);

    // 后续处理
    if (_options.patchRemote) {
      let list2 = [] as WnObj[];
      for (let i = 0; i < list.length; i++) {
        let li = _.cloneDeep(list[i]);
        let li2 = _options.patchRemote(li, i);
        if (li2) {
          list2.push(li2);
        }
      }
      list = list2;
    }

    // 更新结果集
    _remote.value = list ?? [];

    // 更新翻页信息
    if (query.pager) {
      updatelPager(query.pager, pager);
    }

    _action_status.value = undefined;
  }

  /**
   * 创建一个新的 WnObj 对象，并将其添加到本地和远程列表中。
   *
   * @param {WnObj} meta - 要创建的对象的元数据。
   * @returns {Promise<WnObj | undefined>} 返回创建的对象，如果创建失败则返回 undefined。
   * @throws 如果没有父 ID，则抛出错误。
   */
  async function create(meta: WnObj): Promise<WnObj | undefined> {
    meta.pid = _dir_index.value?.id;
    if (!meta.pid) {
      throw 'create need parent id';
    }
    let re = await _obj.create(meta);
    if (re) {
      _local.value.appendToList(re);
      _remote.value?.unshift(re);
    }
    return re;
  }

  //---------------------------------------------
  // 初始化本地数据
  //---------------------------------------------
  async function init(options?: StdListStoreOptions) {
    if (options) {
      setOptions(options);
    }
    // 读取主目录
    await reloadHome();

    // 读取数据
    await reload();
  }

  /**
   * 重新加载主页数据。
   *
   * @async
   * @function reloadHome
   * @throws {Error} 如果 homePath 未找到。
   *
   * @description
   * 该函数用于重新加载主页数据。它首先从指定路径读取主页对象，如果对象不存在且允许自动创建，则会自动创建该对象。
   * 然后，它会初始化索引路径和数据路径。
   *
   * @returns {Promise<void>} 无返回值。
   */
  async function reloadHome() {
    let { homePath, autoCreateHome, indexPath, dataPath } = _options;
    // 读取 home Obj
    let oHome = await _obj.fetch(homePath);

    // 防空:自动创建
    if (!oHome) {
      if (autoCreateHome) {
        oHome = await auto_create_obj(homePath);
      }
    }
    // 再次防空
    if (!oHome) {
      throw `homePath not found: ${homePath}`;
    }
    _home_obj.value = oHome;

    // init index path
    if (indexPath) {
      let aph = Util.appendPath(`id:${oHome.id}`, indexPath);
      _dir_index.value = await _obj.fetch(aph);
    } else {
      _dir_index.value = oHome;
    }

    // init data path
    if (dataPath) {
      let aph = Util.appendPath(`id:${oHome.id}`, dataPath);
      _dir_data.value = await _obj.fetch(aph);
    }
  }

  /**
   * 重新加载数据的异步函数。
   *
   * 此函数执行以下操作：
   * 1. 调用 `resetLocalChange` 函数重置本地更改。
   * 2. 调用 `queryRemoteList` 函数查询远程列表。
   *
   * @async
   * @function reload
   * @returns {Promise<void>} 返回一个 Promise 对象，表示异步操作的完成。
   */
  async function reload() {
    resetLocalChange();
    //remoteList.value = undefined;
    await queryRemoteList();
  }

  /**
   * 刷新远程列表数据。
   *
   * 该异步函数调用 `queryRemoteList` 函数以刷新远程列表数据。
   *
   * @async
   * @function
   * @returns {Promise<void>} 返回一个 Promise 对象，表示刷新操作的完成。
   */
  async function refresh() {
    await queryRemoteList();
  }

  /*---------------------------------------------
                      
                    输出特性
    
    ---------------------------------------------*/
  return {
    // 数据模型
    _keep_query,
    _keep_select,
    _local,
    _remote,
    currentId: _current_id,
    checkedIds: _checked_ids,
    query,
    //status: _action_status,

    //---------------------------------------------
    //                  计算属性
    //---------------------------------------------
    ActionStatus,
    LoadStatus,
    listData,
    hasCurrent,
    hasChecked,
    changed: computed(() => _local.value.isChanged()),
    isEmpty: computed(() => _.isEmpty(listData.value)),
    isRemoteEmpty: computed(() => _.isEmpty(_remote.value)),
    isLocalEmpty: computed(() => _.isEmpty(_local.value?.localList?.value)),
    CurrentItem,
    CurrentContent: computed(() => _content.ContentText.value),
    //---------------------------------------------
    //                  Getters
    //---------------------------------------------
    //isChanged: () => _local.value.isChanged(),
    getItemId,
    getItemById,
    getItemByIndex,
    getItemByMatch,
    getItemBy,
    getCurrentItem,
    findItemsById,
    findItemsByMatch,
    findItemsBy,
    getFilterField: (key: string, dft?: any) => {
      return _.get(query.filter, key) ?? dft;
    },
    //---------------------------------------------
    //                  本地方法
    //---------------------------------------------
    resetLocalChange,
    clearRemoteList,

    setQuery(q: ComboFilterValue) {
      _.assign(query, q);
      __save_local_query();
    },

    setFilter(filter: QueryFilter) {
      query.filter = _.cloneDeep(filter);
      __save_local_query();
    },

    setSorter(sorter: QuerySorter) {
      query.sorter = _.cloneDeep(sorter);
      __save_local_query();
    },

    setPager(page: Partial<SqlPagerInput>) {
      if (!query.pager) {
        query.pager = {
          pageNumber: 1,
          pageSize: 20,
        };
      }
      updatelPager(query.pager, page);
      __save_local_query();
    },

    addLocalItem(meta: WnObj) {
      _local.value.appendToList(meta);
    },

    updateCurrent,
    updateItem,
    updateItems,
    updateChecked,

    removeChecked,
    removeItems,
    clear,
    updateSelection,
    cancelSelection,
    //---------------------------------------------
    // 读写内容
    //---------------------------------------------
    loadCurrentContent,
    setCurrentContent,
    saveCurrentContent,
    //---------------------------------------------
    // 本地化存储状态
    //---------------------------------------------
    saveLocalQuery: __save_local_query,
    resetLocalQuery: __reset_local_query,
    saveLocalSelect: __save_local_select,
    resetLocalSelect: __reset_local_select,
    setAutoLoadContent,
    assignOptions,
    setOptions,
    //---------------------------------------------
    //                  与控件绑定
    //---------------------------------------------
    async onSelect(payload: TableSelectEmitInfo) {
      let currentId = (payload.currentId as string) ?? undefined;
      let checkedIds = Util.mapTruthyKeys(payload.checkedIds) as string[];
      await updateSelection(currentId, checkedIds);
      __save_local_select();
    },

    //---------------------------------------------
    //                  远程方法
    //---------------------------------------------
    queryRemoteList,
    create,
    init,
    reload,
    refresh,
  };
}

/**
 * 维持全局单例
 */
//const _stores = new Map<string, DataListStoreFeature>();

export function useStdListStore(options?: StdListStoreOptions): StdListStore {
  return defineStdListStore(options);
}
