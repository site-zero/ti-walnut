import { FormProps, InputBoxProps, LabelProps } from '@site0/tijs';
import { WnObjUploadBarProps } from '../../input';
import { WnSliderEditorApi } from './use-wn-slider-editor-api';
import { WnSliderEditorProps } from './wn-slider-editor-types';

export function useWnSliderEditorGUIForm(
  props: WnSliderEditorProps,
  api: WnSliderEditorApi
): FormProps {
  return {
    className: 'fit-parent',
    layoutHint: 1,
    data: api.CurrentMedia.value,
    emptyRoadblock: {
      icon: 'fas-photo-film',
      text: 'i18n:nil-item',
    },
    fields: [
      {
        title: 'Media',
        name: 'oid',
        disabled: props.meta?.id ? false : true,
        comType: 'WnObjUploadTile',
        comConf: {
          valueType: 'id',
          upload: props.upload,
        } as WnObjUploadBarProps,
      },
      {
        title: 'Group',
        name: 'group',
        comType: 'TiInput',
        comConf: {} as InputBoxProps,
      },
      {
        title: 'Title',
        name: 'title',
        comType: 'TiInput',
        comConf: {} as InputBoxProps,
      },
      {
        title: 'MIME',
        name: 'mime',
        comType: 'TiLabel',
        comConf: {} as LabelProps,
      },
      {
        title: 'Href',
        name: 'href',
        comType: 'TiInput',
        comConf: {} as InputBoxProps,
      },
    ],
  };
}
