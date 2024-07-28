import { DateTime, ENV_KEYS, getEnv } from '@site0/tijs';
import { useObjColumns } from './use-obj-columns';

export function initWalnutObjDefaultColumns() {
  const _ocs = useObjColumns();
  // ----------------------------- 基本信息
  _ocs.addColumn('id', { name: 'id', title: 'ID' });
  _ocs.addColumn('pid', { name: 'pid', title: 'PID' });
  _ocs.addColumn('obj-nm-title-icon', {
    title: 'i18n:wn-obj-nm',
    name: ['nm', 'icon', 'race', 'mime', 'tp', 'title'],
    type: 'Object',
    comType: 'WnObjThumb',
  });
  _ocs.addColumn('title', { name: 'title', title: 'i18n:wn-obj-title' });
  _ocs.addColumn('tp', { name: 'tp', title: 'i18n:wn-obj-tp' });
  _ocs.addColumn('race', { name: 'race', title: 'i18n:wn-obj-race' });
  _ocs.addColumn('mime', { name: 'mime', title: 'i18n:wn-obj-mime' });
  // ----------------------------- 权限
  _ocs.addColumn('d0', { name: 'd0', title: 'D0' });
  _ocs.addColumn('d1', { name: 'd1', title: 'D1' });
  _ocs.addColumn('c', { name: 'c', title: 'i18n:wn-obj-c' });
  _ocs.addColumn('m', { name: 'm', title: 'i18n:wn-obj-m' });
  _ocs.addColumn('g', { name: 'g', title: 'i18n:wn-obj-g' });
  _ocs.addColumn('md', { name: 'md', title: 'i18n:wn-obj-md' });
  // ----------------------------- 时间戳
  _ocs.addColumn('ct', {
    name: 'ct',
    title: 'i18n:wn-obj-ct',
    type: 'AMS',
    transformer: (ct: number) => {
      let fmt = getEnv(ENV_KEYS.DFT_DATETIME_FORMAT, 'yyyy-MM-dd HH:mm');
      return DateTime.format(ct, { fmt });
    },
  });
  _ocs.addColumn('lm', {
    name: 'lm',
    title: 'i18n:wn-obj-lm',
    type: 'AMS',
    transformer: (lm: number) => {
      let fmt = getEnv(ENV_KEYS.DFT_DATETIME_FORMAT, 'yyyy-MM-dd HH:mm');
      return DateTime.format(lm, { fmt });
    },
  });
}
