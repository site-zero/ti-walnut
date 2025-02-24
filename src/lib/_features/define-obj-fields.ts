import { InputBoxProps, LabelProps, useObjFields } from '@site0/tijs';

export function initWalnutObjDefaultFields() {
  const _ofs = useObjFields();
  // ----------------------------- 基本信息
  _ofs.setField('id', {
    name: 'id',
    title: 'ID',
    comType: 'TiLabel',
    comConf: {
      nowrap: true,
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  _ofs.setField('pid', {
    name: 'pid',
    title: 'PID',
    comType: 'TiLabel',
    comConf: {
      nowrap: true,
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  _ofs.setField('title', {
    name: 'title',
    title: 'i18n:wn-obj-title',
    comType: 'TiLabel',
    comConf: {
      nowrap: true,
      placeholder: 'i18n:nil',
    } as LabelProps,
    activatedComType: 'TiInput',
    activatedComConf: {
      autoSelect: false,
      boxFocused: true,
    } as InputBoxProps,
  });

  _ofs.setField('nm', {
    name: 'nm',
    title: 'i18n:wn-obj-nm',
    comType: 'TiLabel',
    comConf: {
      nowrap: true,
      placeholder: 'i18n:nil',
    } as LabelProps,
    activatedComType: 'TiInput',
    activatedComConf: {
      autoSelect: false,
      boxFocused: true,
    } as InputBoxProps,
  });
  _ofs.setField('race', {
    name: 'race',
    title: 'i18n:wn-obj-race',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:unknown',
      nowrap: true,
    } as LabelProps,
  });
  _ofs.setField('sort', {
    name: 'sort',
    title: 'i18n:wn-obj-sort',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:unknown',
      nowrap: true,
    } as LabelProps,
  });

  // ----------------------------- 权限
  _ofs.setField('d0', {
    name: 'd0',
    title: 'D0',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  _ofs.setField('d1', {
    name: 'd1',
    title: 'D1',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  _ofs.setField('c', {
    name: 'c',
    title: 'i18n:wn-obj-c',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  _ofs.setField('m', {
    name: 'm',
    title: 'i18n:wn-obj-m',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  _ofs.setField('g', {
    name: 'g',
    title: 'i18n:wn-obj-g',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  _ofs.setField('md', {
    name: 'md',
    title: 'i18n:wn-obj-md',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  // ----------------------------- 内容
  _ofs.setField('tp', {
    name: 'tp',
    title: 'i18n:wn-obj-tp',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
    activatedComType: 'TiInput',
    activatedComConf: {
      autoSelect: false,
      boxFocused: true,
    } as InputBoxProps,
  });
  _ofs.setField('mime', {
    name: 'mime',
    title: 'i18n:wn-obj-mime',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
      nowrap: true,
    } as LabelProps,
    activatedComType: 'TiInput',
    activatedComConf: {
      autoSelect: false,
      boxFocused: true,
    } as InputBoxProps,
  });
  _ofs.setField('len', {
    name: 'len',
    title: 'i18n:wn-obj-len',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  _ofs.setField('sha1', {
    name: 'sha1',
    title: 'i18n:wn-obj-sha1',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
      nowrap: true,
    } as LabelProps,
  });
  // ----------------------------- 时间戳
  _ofs.setDateTimeLabelField('ct', 'i18n:wn-obj-ct');
  _ofs.setDateTimeLabelField('lm', 'i18n:wn-obj-lm');
  _ofs.setDateTimeLabelField('expi', 'i18n:wn-obj-expi');
}
