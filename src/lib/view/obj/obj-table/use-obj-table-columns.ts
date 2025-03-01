import { ColumnRefer } from '@site0/tijs';

export function getObjTableColumns(): ColumnRefer[] {
  return [
    //基本信息',
    'obj.nm-title-icon',
    '~obj.nm',
    '~obj.title',
    '~obj.d0',
    '~obj.d1',
    '~obj.id',
    //'obj.pid',
    '~obj.race',
    //文件信息',
    'obj.tp',
    '~obj.mime',
    'obj.len',
    '~obj.sha1',
    //权限信息',
    '~obj.c',
    '~obj.m',
    '~obj.g',
    '~obj.md',
    //时间戳',
    '~obj.ct',
    'obj.lm',
  ];
}
