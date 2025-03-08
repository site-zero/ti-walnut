import { LayoutGridProps } from '@site0/tijs';
import { RdsBrowserProps } from './rds-browser-types';
import { getKeepName } from './use-rds-browser';

export function useRdsBrowserLayout(props: RdsBrowserProps): LayoutGridProps {
  return {
    className: 'fit-parent as-card with-shadow r-s',
    keepSizes: getKeepName(props, 'GUI-Layout-Sizes'),
    gridStyle: {
      backgroundColor: 'var(--ti-color-body)',
      padding: 'var(--bunya-grid-gap)',
    },
    layout: {
      gridTemplateColumns: props.layoutQuickColumns,
      gridTemplateRows: 'auto auto 1fr auto',
      gap: 'var(--bunya-grid-gap)',
    },
    blocks: [
      {
        name: 'actions',
        grid: {
          gridColumn: 'span 2',
        },
      },
      {
        name: 'filter',
        grid: {
          gridColumn: 'span 2',
        },
      },
      {
        name: 'list',
        overflowMode:'cover',
        grid: {
          gridColumnStart: '1',
        },
      },
      {
        name: 'pager',
        grid: {
          gridColumnStart: '1',
        },
      },
      {
        name: 'detail',
        overflowMode:'cover',
        grid: {
          gridColumnStart: '2',
          gridRowStart: '3',
          gridRowEnd: '5',
        },
        bar: {
          mode: 'column',
          adjustIndex: 1,
          position: 'prev',
        },
      },
    ],
  };
}
