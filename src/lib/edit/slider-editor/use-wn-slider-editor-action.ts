import { ActionBarProps } from '@site0/tijs';
import { ObjDropToUploadApi } from '../../view/obj/obj-table/use-obj-drop-to-upload';
import { WnSliderEditorApi } from './use-wn-slider-editor-api';
import { WnSliderEditorProps } from './wn-slider-editor-types';

export function useWnSliderEditorAction(
  _props: WnSliderEditorProps,
  api: WnSliderEditorApi,
  upload_api: ObjDropToUploadApi
): ActionBarProps {
  return {
    itemSize: 's',
    vars: {
      hasChecked: api.selection.checkedIds.size > 0,
      hasCurrent: api.selection.currentId ? true : false,
    },
    items: [
      {
        icon: 'zmdi-long-arrow-up',
        text: 'i18n:move-up',
        enabled: {
          hasChecked: true,
        },
        action: () => {
          api.moveCheckedTo('prev');
        },
      },
      {
        icon: 'zmdi-long-arrow-down',
        text: 'i18n:move-down',
        enabled: {
          hasChecked: true,
        },
        action: () => {
          api.moveCheckedTo('next');
        },
      },
      {},
      {
        icon: 'fas-trash',
        text: 'i18n:remove',
        enabled: {
          hasChecked: true,
        },
        action: () => {
          api.removeCheckedMedias();
        },
      },
      {},
      {
        icon: 'fas-upload',
        text: 'i18n:upload',
        action: () => {
          upload_api.doUploadFiles();
        },
      },
    ],
  };
}
