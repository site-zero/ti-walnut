import { ColumnRefer, KeepInfo, TableEmitter } from '@site0/tijs';
import { WnUploadFileOptions } from '../../../../core';
import { WnObj } from '../../../_types';

export type WnObjTableEmitter = TableEmitter & {
  (event: 'upload:done', objs: WnObj[]): void;
};

export type WnObjTableProps = {
  keepColumns?: KeepInfo;
  columns?: ColumnRefer[];
  data?: WnObj[];
  currentId?: string;
  checkedIds?: string[];
  upload?: WnUploadFileOptions;
};
