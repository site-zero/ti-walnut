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
  TableRowID,
  TableSelectEmitInfo,
  Util,
  Vars,
} from '@site0/tijs';
import _ from 'lodash';
import { computed, ComputedRef } from 'vue';
import { SqlResult } from '../..';
import { DataListStore } from '../../_store';
import { RdsBrowserProps } from './rds-browser-types';
//--------------------------------------------------
/**
 * 获取本地状态保存的特性
 */
export function getKeepName(
  props: RdsBrowserProps,
  key: string
): KeepProps | undefined {
  if (props.keepName) {
    let keepAt = ['WnRdsBrowser', props.keepName, key].join('-');
    let keepMode =
      _.get(props.keepModes, key) ?? props.defaultKeepMode ?? 'local';
    return {
      keepAt,
      keepMode,
    };
  }
}
/**
 * 视图主体逻辑入口
 *
 * @param Data  数据访问
 * @param props  控件属性
 * @returns 视图主体逻辑
 */
export function useRdsBrowser(
  Data: ComputedRef<DataListStore>,
  props: RdsBrowserProps
) {
  //--------------------------------------------------
  const TableEmptyRoadblock = computed((): RoadblockProps => {
    if (Data.value.status.value == 'loading') {
      return {
        icon: 'fas-spinner fa-pulse',
        text: 'i18n:loading',
      };
    }
    return {
      text: 'i18n:empty-data',
      mode: 'auto',
      layout: 'A',
      size: 'normal',
      opacity: 'shadowy',
      icon: 'zmdi-apps',
    };
  });

  //--------------------------------------------------
  const StatusVars = computed(() => ({
    changed: Data.value.changed.value,
    hasChecked: Data.value.hasChecked.value,
    hasCurrent: Data.value.hasCurrent.value,
    reloading: Data.value.status.value == 'loading',
    saving: Data.value.status.value == 'saving',
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
  const TableCurrentId = computed(() => Data.value.currentId.value);
  const TableCheckedIds = computed(() =>
    Util.arrayToMap(Data.value.checkedIds.value)
  );

  //--------------------------------------------------
  // 控件: 过滤器
  //--------------------------------------------------
  const DataFilterConfig = computed(() => {
    return _.defaults({}, props.filter, {
      layout: 'oneline',
      keepMajor: getKeepName(props, 'Filter-Major'),
      value: {
        filter: Data.value.query.filter,
        sorter: Data.value.query.sorter,
      },
    } as ComboFilterProps) as ComboFilterProps;
  });

  //--------------------------------------------------
  // 控件: 翻页器
  //--------------------------------------------------
  const DataPagerConfig = computed(() => {
    return {
      mode: 'jumper',
      ...(Data.value.query.pager ?? {}),
    } as PagerProps;
  });

  //--------------------------------------------------
  // 控件: 表格
  //--------------------------------------------------
  const DataTableConfig = computed(() => {
    return _.assign(
      {
        className: 'cover-parent',
        keepColumns: getKeepName(props, 'Table-Columns'),
        multi: true,
        emptyRoadblock: TableEmptyRoadblock.value,
        currentId: TableCurrentId.value,
        checkedIds: TableCheckedIds.value,
      } as TableProps,
      props.table,
      {
        data: Data.value.listData.value,
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
        defaultComType: 'TiInput',
        emptyRoadblock: { text: 'i18n:nil-item', icon: 'zmdi-arrow-left' },
      } as FormProps,
      props.form,
      {
        data: Data.value.getCurrentItem(),
      } as FormProps
    ) as FormProps;
  });

  //--------------------------------------------------
  let getId: (it: Vars) => TableRowID | undefined;
  if (_.isFunction(props.getItemId)) {
    getId = props.getItemId;
  } else if (_.isString(props.getItemId)) {
    let key = props.getItemId;
    getId = (it: Vars) => it[key];
  } else {
    getId = (it: Vars) => it.id;
  }

  //--------------------------------------------------
  // 方法
  //--------------------------------------------------
  function canRefreshSafely() {
    let msg = (props.messages ?? {}).warn_refresh;
    if (msg) {
      if (Data.value.changed.value) {
        Alert(msg, { type: 'warn' });
        return false;
      }
    }
    return true;
  }

  async function refresh() {
    if (canRefreshSafely()) {
      await Data.value.reload();
    }
  }

  //--------------------------------------------------
  // 响应事件
  //--------------------------------------------------
  function onTableRowSelect(payload: TableSelectEmitInfo) {
    Data.value.onSelect(payload);
  }

  function onFilterChange(payload: ComboFilterValue) {
    // 防守
    if (!canRefreshSafely()) {
      return;
    }
    // 更新 filter / sorter
    Data.value.setQuery(payload);
    Data.value.setPager({ pageNumber: 1 });

    // 自动重新加载
    Data.value.reload();
  }

  function onFilterReset() {
    if (!canRefreshSafely()) {
      return;
    }
    // 更新 filter / sorter
    Data.value.setQuery(DefaultFilterQuery.value);
    Data.value.setPager({ pageNumber: 1 });

    // 自动重新加载
    Data.value.reload();
  }

  function onPageNumberChange(pn: number) {
    // 防守
    if (!canRefreshSafely()) {
      return;
    }
    // 更新
    Data.value.setPager({ pageNumber: pn });
    // 自动重新加载
    Data.value.reload();
  }

  function onPageSizeChange(pgsz: number) {
    // 防守
    if (!canRefreshSafely()) {
      return;
    }
    // 更新
    Data.value.setPager({ pageNumber: 1, pageSize: pgsz });
    // 自动重新加载
    Data.value.reload();
  }

  function onCurrentMetaChange(payload: SqlResult) {
    console.log('onDetailChange', payload);
    Data.value.updateCurrent(payload);
  }

  async function onActionFire(barEvent: ActionBarEvent) {
    let { name, payload } = barEvent;
    console.log('onActionFire', name, payload);

    // 自定义处理
    if (props.handleAction) {
      let mark = await props.handleAction(Data.value, name, payload) ?? 'unhandled';
      if (mark == 'handled') {
        return;
      }
    }

    // Reload
    if ('reload' == name) {
      refresh();
    }
    // Create
    else if ('create' == name) {
      if (props.createNewItem) {
        let it = props.createNewItem(Data.value);
        let id = getId(it);
        Data.value.addLocalItem(it);
        if (!_.isNil(id)) {
          Data.value.updateSelection(id);
        }
      }
    }
    // Save
    else if ('save' == name) {
      Data.value.saveChange();
    }
    // Drop
    else if ('reset' == name) {
      let msg = (props.messages ?? {}).warn_drop_change;
      if (msg) {
        Confirm(msg, { type: 'warn' }).then((yes) => {
          if (yes) {
            Data.value.resetLocalChange();
          }
        });
      }
    }
    // Remove
    else if ('remove' == name) {
      Data.value.removeChecked();
    }
    // warn unhandled action
    else {
      console.warn('Unhandled action:', name, payload);
    }
  }
  //--------------------------------------------------
  // 输出特性
  //--------------------------------------------------
  return {
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
