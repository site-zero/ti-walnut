import { LayoutSchema } from '@site0/tijs';
import { HubView } from '../../../_store';
import { useRdsBrowserActions } from './rds-browser-actions';
import { RdsBrowserApi, RdsBrowserProps } from './rds-browser-types';

export function useRdsBrowserSchema(
  props: RdsBrowserProps,
  _api: RdsBrowserApi,
  _hub_view?: HubView
): LayoutSchema {
  return {
    actions: {
      comType: 'TiActionBar',
      comConf: useRdsBrowserActions(props, _api),
      events: {
        fire: ({ data }) => {
          _api.onActionFire(data);
        },
      },
    },
    filter: {
      comType: 'TiComboFilter',
      comConf: _api.DataFilterConfig.value,
      events: {
        change: ({ data }) => {
          _api.onFilterChange(data);
        },
        search: () => {
          _api.refresh();
        },
        reset: () => {
          _api.onFilterReset();
        },
      },
    },
    pager: {
      comType: 'TiPager',
      comConf: _api.DataPagerConfig.value,
      events: {
        'change-page-number': ({ data }) => {
          console.log('change-page-number', data);
          _api.onPageNumberChange(data);
        },
        'change-page-size': ({ data }) => {
          console.log('change-page-size', data);
          _api.onPageSizeChange(data);
        },
      },
    },
    list: {
      comType: 'TiTable',
      comConf: _api.DataTableConfig.value,
      events: {
        select: ({ data }) => {
          _api.onTableRowSelect(data);
          let { checked, current } = data;
          if (_hub_view) {
            _hub_view.global.data.selectedRows = checked.length;
            _hub_view.global.data.currentObj = current;
          }
        },
      },
    },
    detail: {
      comType: 'TiForm',
      comConf: _api.DataFormConfig.value,
      events: {
        change: ({ data }) => {
          _api.onCurrentMetaChange(data);
        },
      },
    },
  };
}
