import {
  ComboFilterProps,
  FormProps,
  GridFieldsProps,
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
import { DataListStoreFeature } from '../../_store';
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
//--------------------------------------------------
// 定义特性
//--------------------------------------------------
export type RdsBrowserFeature = {
  TableEmptyRoadblock: ComputedRef<RoadblockProps>;
  StatusVars: ComputedRef<Vars>;

  TableCurrentId: ComputedRef<TableRowID | undefined>;
  TableCheckedIds: ComputedRef<Map<TableRowID, boolean>>;

  DataFilterConfig: ComputedRef<ComboFilterProps>;
  DataPagerConfig: ComputedRef<PagerProps>;
  DataTableConfig: ComputedRef<TableProps>;
  DataFormConfig: ComputedRef<GridFieldsProps>;

  onTableRowSelect: (payload: TableSelectEmitInfo) => void;
};

/**
 * 视图主体逻辑入口
 *
 * @param Data  数据访问
 * @param props  控件属性
 * @returns 视图主体逻辑
 */
export function useRdsBrowser(
  Data: ComputedRef<DataListStoreFeature>,
  props: RdsBrowserProps
): RdsBrowserFeature {
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
    reloading: Data.value.status.value == 'loading',
  }));
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
        titleStyle: {
          justifyContent: 'flex-start',
          padding: '.6em 1em',
        },
      } as FormProps,
      props.form,
      {
        data: Data.value.getCurrentItem(),
      } as FormProps
    ) as FormProps;
  });

  //--------------------------------------------------
  // 响应事件
  //--------------------------------------------------
  function onTableRowSelect(payload: TableSelectEmitInfo) {
    Data.value.onSelect(payload);
  }
  //--------------------------------------------------
  // 输出特性
  //--------------------------------------------------
  return {
    TableEmptyRoadblock,
    StatusVars,

    TableCurrentId,
    TableCheckedIds,

    DataFilterConfig,
    DataPagerConfig,
    DataTableConfig,
    DataFormConfig,

    onTableRowSelect,
  };
}
