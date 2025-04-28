import { LayoutGridProps } from '@site0/tijs';
import { WnSliderEditorApi } from './use-wn-slider-editor-api';
import { WnSliderEditorProps } from './wn-slider-editor-types';

export function useWnSliderEditorLayout(
  _props: WnSliderEditorProps,
  api: WnSliderEditorApi
): LayoutGridProps {
  return {
    className: 'fit-parent',
    keepSizes: api.getKeepName('local: WnSliderEditor-${id}-MainLayouSizes'),
    gridStyle: {
      backgroundColor: 'var(--ti-color-body)',
    },
    layout: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto 1fr 100px',
      gap: '1px',
    },
    itemStyle: {
      backgroundColor: 'var(--ti-color-card)',
    },
    blocks: [
      {
        name: 'actions',
        grid: { gridColumn: 'span 2' },
      },
      //TODO 这里增加一个预览功能
      // {
      //   name: 'preview',
      //   grid: { gridColumn: 'span 2' },
      //   bar: {
      //       mode: 'row',
      //       adjustIndex: 1,
      //       position: 'next',
      //     },
      // },
      {
        name: 'list',
        overflowMode: 'cover',
      },
      {
        name: 'media',
        overflowMode: 'cover',
        bar: {
          mode: 'column',
          adjustIndex: 1,
          position: 'prev',
        },
      },
      {
        name: 'form',
        overflowMode: 'cover',
        grid: { gridColumn: 'span 2' },
        bar: {
          mode: 'row',
          adjustIndex: 2,
          position: 'prev',
        },
      },
    ],
  };
}
