import { DateTime, TableInputColumn } from '@site0/tijs';

export const READONLY_FIELDS = new Map<string, TableInputColumn>();
// ----------------------------- 基本信息
READONLY_FIELDS.set('id', { name: 'id', title: 'ID' });
READONLY_FIELDS.set('pid', { name: 'pid', title: 'PID' });
READONLY_FIELDS.set('nm-icon', {
  name: ['nm', 'icon'],
  title: 'i18n:wn-obj-nm',
});
READONLY_FIELDS.set('tp', { name: 'tp', title: 'i18n:wn-obj-tp' });
READONLY_FIELDS.set('race', { name: 'race', title: 'i18n:wn-obj-race' });
READONLY_FIELDS.set('mime', { name: 'mime', title: 'i18n:wn-obj-mime' });
// ----------------------------- 权限
READONLY_FIELDS.set('d0', { name: 'd0', title: 'D0' });
READONLY_FIELDS.set('d1', { name: 'd1', title: 'D1' });
READONLY_FIELDS.set('c', { name: 'c', title: 'i18n:wn-obj-c' });
READONLY_FIELDS.set('m', { name: 'm', title: 'i18n:wn-obj-m' });
READONLY_FIELDS.set('g', { name: 'g', title: 'i18n:wn-obj-g' });
READONLY_FIELDS.set('md', { name: 'md', title: 'i18n:wn-obj-mime' });
// ----------------------------- 时间戳
READONLY_FIELDS.set('ct', {
  name: 'ct',
  title: 'i18n:wn-obj-ct',
  type: 'AMS',
  transformer: (ct: number) => {
    return DateTime.format(ct);
  },
});
READONLY_FIELDS.set('lm', {
  name: 'lm',
  title: 'i18n:wn-obj-lm',
  type: 'AMS',
  transformer: (lm: number) => {
    return DateTime.timeText(lm);
  },
});
