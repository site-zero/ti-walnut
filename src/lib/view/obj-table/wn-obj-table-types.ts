import { TableProps } from '@site0/tijs';

export type WnObjTableProps = Omit<TableProps, 'columns'> & {
  columns?: string[];
};
