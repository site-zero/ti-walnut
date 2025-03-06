import { Vars } from '@site0/tijs';
import { WnObjViewerEmitter, WnObjViewerProps } from './wn-obj-viewer-types';
import { isObjContentEditable } from '../../../../core';

export type WnObjViewerApi = ReturnType<typeof useWnObjViewer>;

export function useWnObjViewer(
  props: WnObjViewerProps,
  emit: WnObjViewerEmitter
) {
  function isDIR() {
    return 'DIR' === props.meta?.race;
  }
  function isFILE() {
    return 'FILE' === props.meta?.race;
  }

  function canEditContent() {
    if (!props.meta) {
      return false;
    }
    return isObjContentEditable(props.meta);
  }

  function onMetaChange(delta: Vars) {
    //console.log('onMetaChange', delta);
    emit('meta-change', delta);
  }

  function onContentChange(content: string) {
    //console.log('onContentChange', content);
    emit('content-change', content);
  }

  return { isDIR, isFILE, canEditContent, onMetaChange, onContentChange };
}
