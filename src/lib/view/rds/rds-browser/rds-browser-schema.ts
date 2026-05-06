import { LayoutSchema } from "@site0/tijs";
import { useRdsBrowserActions } from "./rds-browser-actions";
import { RdsBrowserApi, RdsBrowserProps } from "./rds-browser-types";

export function useRdsBrowserSchema(
  props: RdsBrowserProps,
  _api: RdsBrowserApi
): LayoutSchema {
  return {
    actions: {
      comType: "TiActionBar",
      comConf: useRdsBrowserActions(props, _api),
      events: {
        fire: ({ data }) => {
          _api.onActionFire(data);
        },
      },
    },
    filter: {
      comType: "TiComboFilter",
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
      comType: "TiPager",
      comConf: _api.DataPagerConfig.value,
      events: {
        "change-page-number": ({ data }) => {
          console.log("change-page-number", data);
          _api.onPageNumberChange(data);
        },
        "change-page-size": ({ data }) => {
          console.log("change-page-size", data);
          _api.onPageSizeChange(data);
        },
      },
    },
    list: {
      comType: "TiTable",
      comConf: _api.DataTableConfig.value,
      events: {
        select: ({ data }) => {
          _api.onTableRowSelect(data);
        },
      },
    },
    detail: {
      comType: "TiForm",
      comConf: _api.DataFormConfig.value,
      events: {
        change: ({ data }) => {
          _api.onCurrentMetaChange(data);
        },
      },
    },
  };
}
