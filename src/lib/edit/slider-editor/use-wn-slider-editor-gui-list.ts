import { Icons, ListProps } from '@site0/tijs';
import { WnSliderEditorApi } from './use-wn-slider-editor-api';
import { WnSliderEditorProps } from './wn-slider-editor-types';

export function useWnSliderEditorGUIList(
  _props: WnSliderEditorProps,
  api: WnSliderEditorApi
): ListProps {
  return {
    className: 'fit-parent',
    data: api.MediaListData.value,
    getId: (item) => item.id,
    getText: (item) => [item.index + 1, item.title].join(' - '),
    getValue: (item) => item.oid,
    getIcon: (item) => Icons.getIcon({ mime: item.mime }),
    size: 'b',
    autoI18n: false,
    borderStyle: 'dashed',
    multi: true,
    showChecker: true,
    currentId: api.selection.currentId,
    checkedIds: api.selection.checkedIds,
  };
}
