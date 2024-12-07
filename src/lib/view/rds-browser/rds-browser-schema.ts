import { LayoutSchema } from '@site0/tijs';
import { RdsListStore } from '../../_store';
import { useRdsBrowserActions } from './rds-browser-actions';
import { RdsBrowserFeature, RdsBrowserProps } from './rds-browser-types';

export function useRdsBrowserSchema(
  props: RdsBrowserProps,
  Data: RdsListStore,
  _RD: RdsBrowserFeature
): LayoutSchema {
  return {
    actions: {
      comType: 'TiActionBar',
      comConf: useRdsBrowserActions(props, Data, _RD),
      events: {
        fire: ({ data }) => {
          _RD.onActionFire(data);
        },
      },
    },
    filter: {
      comType: 'TiComboFilter',
      comConf: _RD.DataFilterConfig.value,
      events: {
        change: ({ data }) => {
          _RD.onFilterChange(data);
        },
        search: () => {
          _RD.refresh();
        },
        reset: () => {
          _RD.onFilterReset();
        },
      },
    },
    pager: {
      comType: 'TiPager',
      comConf: _RD.DataPagerConfig.value,
      events: {
        'change-page-number': ({ data }) => {
          console.log('change-page-number', data);
          _RD.onPageNumberChange(data);
        },
        'change-page-size': ({ data }) => {
          console.log('change-page-size', data);
          _RD.onPageSizeChange(data);
        },
      },
    },
    list: {
      comType: 'TiTable',
      comConf: _RD.DataTableConfig.value,
      events: {
        select: ({ data }) => {
          _RD.onTableRowSelect(data);
        },
      },
    },
    detail: {
      comType: 'TiForm',
      comConf: _RD.DataFormConfig.value,
      events: {
        change: ({ data }) => {
          _RD.onCurrentMetaChange(data);
        },
      },
    },
  };
}
