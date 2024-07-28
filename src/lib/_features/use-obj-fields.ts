import { FormField, Str } from '@site0/tijs';
import _ from 'lodash';
import { initWalnutObjDefaultFields } from './define-obj-fields';

//const log = getLogger('wn.obj-fields');

export type QuickFieldInfo = {
  _key: string;
  name?: string;
  title?: string;
  required?: boolean;
  colStart?: number;
  colSpan?: number;
  rowStart?: number;
  rowSpan?: number;
};

//-----------------------------------------------
export type WnObjFieldsFeature = {
  getName: () => string;
  getField: (uniqKey: string, field: FormField) => FormField;
  getFieldList: (keys: string | string[], fld?: FormField) => FormField[];
  getFieldGroup: (
    title: string,
    keys: string | string[],
    groupSetup?: FormField
  ) => FormField;
  setField: (uniqKey: string, field: FormField) => void;
};
//-----------------------------------------------
/**
 * 定义表单管理特性
 */
function defineObjFields(featureName: string): WnObjFieldsFeature {
  /**
   * 准备一个表单字段的集合
   */
  const _FIELDS = new Map<string, FormField>();

  /**
   * 获取一个字段
   *
   * @param uniqKey
   * @param field
   * @returns  字段定义
   */
  function getField(uniqKey: string, field: FormField = {}): FormField {
    let finfo = parseNameForObjField(uniqKey);
    let _fld = _FIELDS.get(finfo._key);
    if (!_fld) {
      debugger;
      throw `Fail to found field ['${uniqKey}']`;
    }
    let re = _.cloneDeep(_fld);
    _.assign(re, _.omit(field, 'comConf'));
    re.comConf = re.comConf ?? {};
    _.assign(re.comConf, field?.comConf);

    if (finfo.required) {
      re.required = true;
    }
    re.name = finfo.name ?? re.name ?? finfo._key;
    if ('###' == re.name) {
      re.name = undefined;
    }
    re.title = finfo.title ?? re.title;
    re.colStart = finfo.colStart ?? re.colStart;
    re.colSpan = finfo.colSpan ?? re.colSpan;
    re.rowStart = finfo.rowStart ?? re.rowStart;
    re.rowSpan = finfo.rowSpan ?? re.rowSpan;

    if (re.title && re.title.length > 10) {
      // 如果确定要折行，那么，自动的将后面加一个空格
      // 这样折行以后，就会右对齐
      if (_.isString(re.title) && !re.title.startsWith('i18n:')) {
        re.title = _.trim(re.title) + ' ';
      }
    }

    return re;
  }
  //---------------------------------------------
  /**
   * 获取一个字段定义列表
   *
   * @param keys
   * @param fld
   * @returns 字段定义列表
   */
  function getFieldList(keys: string | string[], fld?: FormField): FormField[] {
    let fld_keys: string[];
    if (_.isString(keys)) {
      fld_keys = Str.splitIgnoreBlank(keys);
    } else {
      fld_keys = [];
      for (let key of keys) {
        let ks = Str.splitIgnoreBlank(key);
        fld_keys.push(...ks);
      }
    }

    let re = [] as FormField[];
    for (let key of fld_keys) {
      re.push(getField(key, fld));
    }
    return re;
  }
  //---------------------------------------------
  /**
   * 获取一个字段组定义
   * @param title
   * @param keys
   * @param groupSetup
   * @returns 字段组定义
   */
  function getFieldGroup(
    title: string,
    keys: string | string[],
    groupSetup: FormField = {}
  ): FormField {
    return {
      ...groupSetup,
      title,
      fields: getFieldList(keys),
    };
  }
  //---------------------------------------------
  /**
   * 添加一个字段定义
   *
   * @param uniqKey
   * @param field
   */
  function setField(uniqKey: string, field: FormField) {
    if (_FIELDS.has(uniqKey)) {
      console.warn(`field '${uniqKey}' already exists!!`);
    }
    if (!field.name) {
      field.name = uniqKey;
    }
    _FIELDS.set(uniqKey, field);
  }
  //---------------------------------------------
  // 输出特性
  //---------------------------------------------
  return {
    getName: () => featureName,
    getField,
    getFieldList,
    getFieldGroup,
    setField,
  };
}
//-----------------------------------------------
const _OBJ_FIELDS_INSTANCES = new Map<string, WnObjFieldsFeature>();
//-----------------------------------------------
export function useObjFields(name = '_DEFAULT_FIELD_SET') {
  let re = _OBJ_FIELDS_INSTANCES.get(name);
  if (!re) {
    re = defineObjFields(name);
    _OBJ_FIELDS_INSTANCES.set(name, re);
  }
  return re;
}
//-----------------------------------------------
// 初始化默认对象字段列表
//-----------------------------------------------
initWalnutObjDefaultFields();
//-----------------------------------------------
/**
 * 根据下面的规则获取字段，主要通过 `uniqKey` 可以很简明的创建字段
 *
 * ```bash
 * uniqKey = 'type=Hello'
 * > {name:'type', title:'Hello'}
 *
 * uniqKey = 'type=hello/Hello'
 * > {name:'hello', title:'Hello'}
 *
 * uniqKey = '*type'
 * > {name:'type', required:true}
 *
 * uniqKey = 'type:2'
 * > {name:'type', colSpan:2}
 *
 * uniqKey = 'type:1/2'
 * > {name:'type', colStart:1, colSpan:2}
 *
 * uniqKey = 'type:1/2:3'
 * > {name:'type', colStart:1, colSpan:2, rowSpan:3}
 * ```
 *
 * @param key 字段键
 */
export function parseNameForObjField(key: string) {
  let required = false;
  if (key.startsWith('*')) {
    required = true;
    key = key.substring(1).trim();
  }

  let parts = key.split(':');
  let name = parts[0];
  let cols = _.nth(parts, 1) ?? '';
  let rows = _.nth(parts, 2) ?? '';
  let re = { required } as QuickFieldInfo;

  // name/title
  let m = /^([^=]+)(=(.+))?/.exec(name);
  if (m) {
    re._key = m[1] ?? name;
    let title = m[3];
    re.title = title;
    if (title) {
      let m2 = /^([^/]*)(\/(.+))?/.exec(title);
      if (m2) {
        re.name = m2[1] || undefined;
        re.title = m2[3];
      }
    }
  }

  const __grid_info = function (input: string) {
    let start: number | undefined;
    let span: number | undefined;
    let m = /^(\d+)(\/(\d+))?/.exec(input);
    if (m) {
      start = parseInt(m[1]);
      if (m[3]) {
        span = parseInt(m[3]);
      }
    }
    return { start, span };
  };

  // cols
  if (cols) {
    let { start, span } = __grid_info(cols);
    re.colStart = start;
    re.colSpan = span;
  }

  // rows
  if (rows) {
    let { start, span } = __grid_info(rows);
    re.rowStart = start;
    re.rowSpan = span;
  }

  return re;
}
