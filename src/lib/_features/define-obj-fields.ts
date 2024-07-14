import {
  DateTime,
  ENV_KEYS,
  FormField,
  getEnv,
  InputBoxProps,
  LabelProps,
} from '@site0/tijs';
import { useObjFields, WnObjFieldsFeature } from './use-obj-fields';

export function initWalnutObjeFields(WN_OBJ_FIELDS: WnObjFieldsFeature) {
  // ----------------------------- 基本信息
  WN_OBJ_FIELDS.setField('id', {
    name: 'id',
    title: 'ID',
    comType: 'TiLabel',
    comConf: {
      nowrap: true,
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  WN_OBJ_FIELDS.setField('pid', {
    name: 'pid',
    title: 'PID',
    comType: 'TiLabel',
    comConf: {
      nowrap: true,
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  WN_OBJ_FIELDS.setField('title', {
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

  WN_OBJ_FIELDS.setField('nm', {
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
  WN_OBJ_FIELDS.setField('race', {
    name: 'race',
    title: 'i18n:wn-obj-race',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:unknown',
      nowrap: true,
    } as LabelProps,
  });

  // ----------------------------- 权限
  WN_OBJ_FIELDS.setField('d0', {
    name: 'd0',
    title: 'D0',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  WN_OBJ_FIELDS.setField('d1', {
    name: 'd1',
    title: 'D1',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  WN_OBJ_FIELDS.setField('c', {
    name: 'c',
    title: 'i18n:wn-obj-c',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  WN_OBJ_FIELDS.setField('m', {
    name: 'm',
    title: 'i18n:wn-obj-m',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  WN_OBJ_FIELDS.setField('g', {
    name: 'g',
    title: 'i18n:wn-obj-g',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  WN_OBJ_FIELDS.setField('md', {
    name: 'md',
    title: 'i18n:wn-obj-md',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  // ----------------------------- 内容
  WN_OBJ_FIELDS.setField('tp', {
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
  WN_OBJ_FIELDS.setField('mime', {
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
  WN_OBJ_FIELDS.setField('len', {
    name: 'len',
    title: 'i18n:wn-obj-len',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
    } as LabelProps,
  });
  WN_OBJ_FIELDS.setField('sha1', {
    name: 'sha1',
    title: 'i18n:wn-obj-sha1',
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:nil',
      nowrap: true,
    } as LabelProps,
  });
  // ----------------------------- 时间戳
  const timeTransformer = (ct: number) => {
    let fmt = getEnv(ENV_KEYS.DFT_DATETIME_FORMAT, 'yyyy-MM-dd HH:mm');
    return DateTime.format(ct, { fmt });
  };
  WN_OBJ_FIELDS.setField('ct', {
    name: 'ct',
    title: 'i18n:wn-obj-ct',
    type: 'AMS',
    transformer: timeTransformer,
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:unknown',
    } as LabelProps,
  });
  WN_OBJ_FIELDS.setField('lm', {
    name: 'lm',
    title: 'i18n:wn-obj-lm',
    type: 'AMS',
    transformer: timeTransformer,
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:unknown',
    } as LabelProps,
  });
  WN_OBJ_FIELDS.setField('expi', {
    name: 'expi',
    title: 'i18n:wn-obj-expi',
    type: 'AMS',
    transformer: timeTransformer,
    comType: 'TiLabel',
    comConf: {
      placeholder: 'i18n:unknown',
    } as LabelProps,
  });
}
