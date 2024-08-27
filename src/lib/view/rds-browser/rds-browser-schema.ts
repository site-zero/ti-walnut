import { EmitAdaptorPayload, LayoutSchema } from '@site0/tijs';
import { RdsBrowserFeature } from './use-rds-browser';
import { useRdsBrowserActions } from './rds-browser-actions';

export function useRdsBrowserSchema(_RD: RdsBrowserFeature): LayoutSchema {
  return {
    actions: {
      comType: 'TiActionBar',
      comConf: useRdsBrowserActions(_RD),
      events: {
        fire: (payload: EmitAdaptorPayload) => {
          _RD.onActionFire(payload.data);
        },
      },
    },
    filter: {
      comType: 'TiComboFilter',
      comConf: _RD.DataFilterConfig.value,
    },
    pager: {
      comType: 'TiPager',
      comConf: _RD.DataPagerConfig.value,
    },
    list: {
      comType: 'TiTable',
      comConf: _RD.DataTableConfig.value,
      events: {
        select: (payload: EmitAdaptorPayload) => {
          _RD.onTableRowSelect(payload.data);
        },
      },
    },
    detail: {
      comType: 'TiForm',
      comConf: _RD.DataFormConfig.value,
    },
  };
}
