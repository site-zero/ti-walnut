import { Vars } from '@site0/tijs';
import { WnObjViewerProps } from './wn-obj-viewer-types';

export type WnObjViewerApi = ReturnType<typeof useWnObjViewer>;

export function useWnObjViewer(props: WnObjViewerProps) {
  function isDIR() {
    return 'DIR' === props.meta?.race;
  }
  function isFILE() {
    return 'FILE' === props.meta?.race;
  }

  function onMetaChange(delta: Vars) {
    console.log('onMetaChange', delta);
  }

  function onContentChange(content: string) {
    console.log('onContentChange', content);
  }

  return { isDIR, isFILE, onMetaChange, onContentChange };
}
