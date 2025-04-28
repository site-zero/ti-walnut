import {
  FormProps,
  InputNumProps,
  LayoutSchema,
  ListSelectEmitInfo,
  ToggleProps,
} from '@site0/tijs';
import { useWnSliderEditorAction } from './use-wn-slider-editor-action';
import { WnSliderEditorApi } from './use-wn-slider-editor-api';
import { useWnSliderEditorGUIForm } from './use-wn-slider-editor-gui-form';
import { useWnSliderEditorGUIList } from './use-wn-slider-editor-gui-list';
import { WnSliderEditorProps } from './wn-slider-editor-types';
import { ObjDropToUploadApi } from '../../view/obj/obj-table/use-obj-drop-to-upload';

export function useWnSliderEditorScheme(
  props: WnSliderEditorProps,
  api: WnSliderEditorApi,
  upload_api: ObjDropToUploadApi
): LayoutSchema {
  return {
    actions: {
      comType: 'TiActionBar',
      comConf: useWnSliderEditorAction(props, api, upload_api),
    },
    list: {
      comType: 'TiList',
      comConf: useWnSliderEditorGUIList(props, api),
      events: {
        select: ({ data }) => {
          //console.log('select', data);
          api.onSelect(data as ListSelectEmitInfo);
        },
      },
    },
    media: {
      comType: 'TiForm',
      comConf: useWnSliderEditorGUIForm(props, api),
      events: {
        change: ({ data }) => {
          api.updateCurrentMedia(data);
        },
      },
    },
    form: {
      comType: 'TiForm',
      comConf: {
        maxFieldNameWidth: 120,
        layoutHint: 2,
        data: api.SliderFormData.value,
        fields: [
          {
            title: 'Auto Group',
            name: 'autoGroup',
            type: 'Boolean',
            comType: 'TiToggle',
            comConf: {} as ToggleProps,
          },
          {
            title: 'Interval(Sec.)',
            name: 'interval',
            type: 'Integer',
            comType: 'TiInputNum',
            comConf: {} as InputNumProps,
          },
        ],
      } as FormProps,
      events: {
        change: ({ data }) => {
          console.log('change', data);
          api.updateSliderData(data);
        },
      },
    },
  };
}
