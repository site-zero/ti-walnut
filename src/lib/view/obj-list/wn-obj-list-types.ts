import { TableProps } from '@site0/tijs';

export type WnObjListProps = Omit<TableProps, 'columns'> & {
  columns?: string[];
};
