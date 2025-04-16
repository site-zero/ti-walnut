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

  /**
   * 指定一个全局 Bus 的键，监听这个事件用来触发 upload
   */
  busUploadKey?:string;
};
