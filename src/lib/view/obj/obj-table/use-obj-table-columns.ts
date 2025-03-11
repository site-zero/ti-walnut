import { ColumnRefer } from '@site0/tijs';

export function getObjTableColumns(): ColumnRefer[] {
  return [
    //基本信息',
    'obj.nm-title-icon::320',
    '~obj.nm::320',
    '~obj.title::320',
    '~obj.d0::50',
    '~obj.d1::50',
    '~obj.id::80',
    //'obj.pid',
    '~obj.race::50',
    //文件信息',
    'obj.tp::50',
    '~obj.mime::80',
    'obj.len::80',
    '~obj.sha1::150',
    //权限信息',
    '~obj.c::50',
    '~obj.m::50',
    '~obj.g::50',
    '~obj.md::50',
    //时间戳',
    'obj.ct::120',
    '~obj.lm::120',
  ];
}
