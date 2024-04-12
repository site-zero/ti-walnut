import { TableCell } from '@site0/tijs';

export const READONLY_FIELDS = new Map<string, TableCell>();
// ----------------------------- 基本信息
READONLY_FIELDS.set('id', { name: 'id' });
READONLY_FIELDS.set('pid', { name: 'pid' });
READONLY_FIELDS.set('nm-icon', { name: ['nm', 'icon'] });
READONLY_FIELDS.set('tp', { name: 'tp' });
READONLY_FIELDS.set('race', { name: 'race' });
READONLY_FIELDS.set('mime', { name: 'mime' });
// ----------------------------- 权限
READONLY_FIELDS.set('d0', { name: 'd0' });
READONLY_FIELDS.set('d1', { name: 'd1' });
READONLY_FIELDS.set('c', { name: 'c' });
READONLY_FIELDS.set('m', { name: 'm' });
READONLY_FIELDS.set('g', { name: 'g' });
READONLY_FIELDS.set('md', { name: 'md' });
// ----------------------------- 时间戳
READONLY_FIELDS.set('ct', { name: 'ct' });
READONLY_FIELDS.set('lm', { name: 'lm' });
