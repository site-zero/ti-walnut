import {
  ActionBarEvent,
  Alert,
  ComboFilterProps,
  ComboFilterValue,
  Confirm,
  FormProps,
  KeepProps,
  PagerProps,
  RoadblockProps,
  TableProps,
  TableSelectEmitInfo,
  Util,
  Vars,
} from "@site0/tijs";
import _ from "lodash";
import { computed } from "vue";
import { Walnut } from "../../../../core/wn";
import { RdsListStoreApi } from "../../../_store";
import { SqlResult } from "../../../_types";
import {
  KeepTarget,
  RdsBrowserEmitter,
  RdsBrowserProps,
  RdsCreateNewItemContext,
} from "./rds-browser-types";
//--------------------------------------------------
/**
 * 获取本地状态保存的特性
 */
export function getKeepName(
  props: RdsBrowserProps,
  key: KeepTarget
): KeepProps | undefined {
  if (props.keepName) {
    let keepAt = ["WnRdsBrowser", props.keepName, key].join("-");
    let keepMode =
      _.get(props.keepModes, key) ?? props.defaultKeepMode ?? "local";
    // 保存模式
    if (!keepMode || "no-keep" == keepMode) {
      return;
    }
    return {
      keepAt,
      keepMode,
    };
  }
}
/**
 * 视图主体逻辑入口
 *
 * @param _rds  数据访问
 * @param props  控件属性
 * @returns 视图主体逻辑
 */
export function useRdsBrowser(
  _rds: RdsListStoreApi,
  props: RdsBrowserProps,
  emit: RdsBrowserEmitter
) {
  //--------------------------------------------------
  const TableEmptyRoadblock = computed((): RoadblockProps => {
    if (_rds.ActionStatus.value == "loading") {
      return {
        icon: "fas-spinner fa-pulse",
        text: "i18n:loading",
      };
    }
    return {
      text: "i18n:empty-data",
      mode: "auto",
      layout: "A",
      size: "normal",
      opacity: "shadowy",
      icon: "zmdi-apps",
    };
  });

  //--------------------------------------------------
  const StatusVars = computed(() => ({
    changed: _rds.changed.value,
    hasChecked: _rds.hasChecked.value,
    hasCurrent: _rds.hasCurrent.value,
    reloading: _rds.ActionStatus.value == "loading",
    saving: _rds.ActionStatus.value == "saving",
  }));

  //--------------------------------------------------
  const DefaultFilterQuery = computed(() => {
    let flt = props.dataStore.query;
    if (_.isFunction(flt)) {
      return flt();
    }
    return flt;
  });

  //--------------------------------------------------
  // 数据
  //--------------------------------------------------
  const TableCurrentId = computed(() => _rds.currentId.value);
  const TableCheckedIds = computed(() =>
    Util.arrayToMap(_rds.checkedIds.value)
  );

  //--------------------------------------------------
  // 控件: 过滤器
  //--------------------------------------------------
  const DataFilterConfig = computed(() => {
    return _.defaults({}, props.filter, {
      layout: "oneline",
      keepMajor: getKeepName(props, "Filter-Major"),
      value: {
        filter: _rds.query.value.filter,
        sorter: _rds.query.value.sorter,
      },
    } as ComboFilterProps) as ComboFilterProps;
  });

  //--------------------------------------------------
  // 控件: 翻页器
  //--------------------------------------------------
  const DataPagerConfig = computed(() => {
    return {
      mode: "jumper",
      ...(_rds.query.value.pager ?? {}),
      count: _rds.listData.value.length,
    } as PagerProps;
  });

  //--------------------------------------------------
  // 控件: 表格
  //--------------------------------------------------
  const DataTableConfig = computed(() => {
    return _.assign(
      {
        className: "cover-parent",
        keepColumns: getKeepName(props, "Table-Columns"),
        multi: true,
        emptyRoadblock: TableEmptyRoadblock.value,
        currentId: TableCurrentId.value,
        checkedIds: TableCheckedIds.value,
      } as TableProps,
      props.table,
      {
        data: _rds.listData.value,
      } as TableProps
    ) as TableProps;
  });

  //--------------------------------------------------
  // 控件: 详情表单
  //--------------------------------------------------
  const DataFormConfig = computed(() => {
    return _.assign(
      {
        maxFieldNameWidth: 100,
        layoutHint: [[6, 1500], [5, 1250], [4, 1000], [3, 750], [2, 500], 1],
        defaultComType: "TiInput",
        emptyRoadblock: { text: "i18n:nil-item", icon: "zmdi-arrow-left" },
      } as FormProps,
      props.form,
      {
        data: _rds.getCurrentItem(),
      } as FormProps
    ) as FormProps;
  });

  //--------------------------------------------------
  let getId: (it: Vars) => string | undefined;
  if (_.isFunction(props.getItemId)) {
    getId = props.getItemId;
  } else if (_.isString(props.getItemId)) {
    let key = props.getItemId;
    getId = (it: Vars) => it[key];
  } else {
    getId = (it: Vars) => it.id ?? it.value;
  }

  //--------------------------------------------------
  // 方法
  //--------------------------------------------------
  function canRefreshSafely() {
    let msg = (props.messages ?? {}).warn_refresh;
    if (msg) {
      if (_rds.changed.value) {
        Alert(msg, { type: "warn" });
        return false;
      }
    }
    return true;
  }

  async function refresh() {
    if (canRefreshSafely()) {
      await _rds.reload();
    }
  }

  //--------------------------------------------------
  // 响应事件
  //--------------------------------------------------
  function onTableRowSelect(payload: TableSelectEmitInfo) {
    _rds.onSelect(payload);
  }

  function onFilterChange(payload: ComboFilterValue) {
    // 防守
    if (!canRefreshSafely()) {
      return;
    }
    // 更新 filter / sorter
    _rds.setQuery(payload);
    _rds.setPager({ pageNumber: 1 });

    // 自动重新加载
    _rds.reload();
  }

  function onFilterReset() {
    if (!canRefreshSafely()) {
      return;
    }
    // 更新 filter / sorter
    _rds.setQuery(DefaultFilterQuery.value);
    _rds.setPager({ pageNumber: 1 });

    // 自动重新加载
    _rds.reload();
  }

  function onPageNumberChange(pn: number) {
    // 防守
    if (!canRefreshSafely()) {
      return;
    }
    // 更新
    _rds.setPager({ pageNumber: pn });
    // 自动重新加载
    _rds.reload();
  }

  function onPageSizeChange(pgsz: number) {
    // 防守
    if (!canRefreshSafely()) {
      return;
    }
    // 更新
    _rds.setPager({ pageNumber: 1, pageSize: pgsz });
    // 自动重新加载
    _rds.reload();
  }

  function onCurrentMetaChange(payload: SqlResult) {
    console.log("onDetailChange", payload);
    _rds.updateCurrent(payload);
  }

  async function onActionFire(barEvent: ActionBarEvent) {
    let { name, payload } = barEvent;
    console.log("onActionFire", name, payload);

    // 自定义处理
    if (props.handleAction) {
      let mark = (await props.handleAction(_rds, name, payload)) ?? "unhandled";
      if (mark == "handled") {
        return;
      }
    }

    // Reload
    if ("reload" == name) {
      refresh();
    }
    // Create
    else if ("create" == name) {
      if (props.createNewItem) {
        // 准备上下文
        let ctx: RdsCreateNewItemContext = { store: _rds };
        if (props.genNewId) {
          ctx.newId = await Walnut.exec(`val @gen '${props.genNewId}'`);
        }

        // 事件
        if (_.isString(props.createNewItem)) {
          emit("create:item", ctx);
          return;
        }

        let it: Vars | undefined = undefined;
        // 普通对象，就是对象模板
        if (_.isPlainObject(props.createNewItem)) {
          it = Util.explainObj(ctx, props.createNewItem) as Vars;
        }
        // 函数调用
        else if (_.isFunction(props.createNewItem)) {
          // 异步调用
          if (Util.isAsyncFunc(props.createNewItem)) {
            it = await props.createNewItem(ctx);
          }
          // 同步方法
          else {
            it = props.createNewItem(ctx);
          }
        }

        // 指定了新数据就创建
        if (it) {
          let id = getId(it);
          _rds.addLocalItem(it);
          if (!_.isNil(id)) {
            _rds.updateSelection(id);
          }
        }
      }
    }
    // Save
    else if ("save" == name) {
      _rds.saveChange({ transLevel: 1 });
    }
    // Drop
    else if ("reset" == name) {
      let msg = (props.messages ?? {}).warn_drop_change;
      if (msg) {
        Confirm(msg, { type: "warn" }).then((yes) => {
          if (yes) {
            _rds.dropChange();
          }
        });
      }
      // 直接干掉
      else {
        _rds.dropChange();
      }
    }
    // Remove
    else if ("remove" == name) {
      _rds.removeChecked();
    }
    // warn unhandled action
    else {
      console.warn("Unhandled action:", name, payload);
    }
  }
  //--------------------------------------------------
  // 输出特性
  //--------------------------------------------------
  return {
    // 数据模型
    store: _rds,

    // 计算属性
    TableEmptyRoadblock,
    StatusVars,

    TableCurrentId,
    TableCheckedIds,
    DefaultFilterQuery,

    DataFilterConfig,
    DataPagerConfig,
    DataTableConfig,
    DataFormConfig,

    // 方法
    refresh,

    // 响应事件
    onTableRowSelect,
    onFilterChange,
    onFilterReset,
    onPageNumberChange,
    onPageSizeChange,
    onCurrentMetaChange,
    onActionFire,
  };
}
