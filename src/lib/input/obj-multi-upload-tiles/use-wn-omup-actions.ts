import { ActionBarProps } from "@site0/tijs";
import { WnObjMultiUploadTilesApi } from "./use-wn-omup-api";
import { WnObjMultiUploadTilesProps } from "./wn-omup-types";

export function useWnObjMultiUploadTilesActions(
  props: WnObjMultiUploadTilesProps,
  api: WnObjMultiUploadTilesApi
): ActionBarProps {
  return {
    vars: api.ActionBarVars.value,
    itemAlign: "right",
    items: [
      {
        icon: "far-paste",
        tip: "Paste to Upload Screenshot",
        visible: props.screenshotName ? true : false,
        action: async () => {
          await api.tryUploadScreenshot();
        },
      },
      {},
      {
        icon: "zmdi-cloud-upload",
        tip: "i18n:upload-file",
        action: async () => {
          await api.doUploadFiles();
        },
      },
      {},
      {
        icon: "fas-download",
        tip: "i18n:download",
        enabled: { hasCurrent: true, idle: true },
        action: () => {
          api.downloadCurrentFile();
        },
      },
      {},
      {
        icon: "zmdi-delete",
        tip: "i18n:del-checked",
        altDisplay: {
          test: { deleting: true },
          icon: "fas-yin-yang fa-pulse",
          text: "i18n:del-ing",
        },
        enabled: { hasChecked: true, idle: true },
        action: () => {
          api.removeChecked();
        },
      },
      // {},
      // {
      //   icon: "zmdi-refresh",
      //   tip: "i18n:refresh",
      //   altDisplay: {
      //     test: { loading: true },
      //     icon: "zmdi-refresh zmdi-hc-spin",
      //     text: "i18n:loading",
      //   },
      //   action: async () => {
      //     await api.refresh();
      //   },
      // },
    ],
  };
}
