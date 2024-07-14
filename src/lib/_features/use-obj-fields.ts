import { FormField, Str } from '@site0/tijs';
import _ from 'lodash';
import { initWalnutObjeFields } from './define-obj-fields';

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
export function parseNameField(key: string) {
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

export type WnObjFieldsFeature = {
  getField: (uniqKey: string, field: FormField) => FormField;
  getFieldList: (keys: string | string[], fld?: FormField) => FormField[];
  getFieldGroup: (
    title: string,
    keys: string | string[],
    groupSetup?: FormField
  ) => FormField;
  setField: (uniqKey: string, field: FormField) => void;
};

const OBJ_FIELDS = new Map<string, FormField>();

export function useObjFields(): WnObjFieldsFeature {
  function getField(uniqKey: string, field: FormField = {}): FormField {
    let finfo = parseNameField(uniqKey);
    let _fld = OBJ_FIELDS.get(finfo._key);
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

  function getFieldList(keys: string | string[], fld?: FormField): FormField[] {
    let fld_keys: string[];
    if (_.isString(keys)) {
      fld_keys = Str.splitIgnoreBlank(keys);
    } else {
      fld_keys = keys;
    }

    let re = [] as FormField[];
    for (let key of fld_keys) {
      re.push(getField(key, fld));
    }
    return re;
  }

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

  function setField(uniqKey: string, field: FormField) {
    if (OBJ_FIELDS.has(uniqKey)) {
      console.warn(`field '${uniqKey}' already exists!!`);
    }
    if (!field.name) {
      field.name = uniqKey;
    }
    OBJ_FIELDS.set(uniqKey, field);
  }

  let re: WnObjFieldsFeature = {
    getField,
    getFieldList,
    getFieldGroup,
    setField,
  };

  // TODO 写在这里虽然很方便，但是感觉味道有点不好 ...
  if (OBJ_FIELDS.size == 0) {
    initWalnutObjeFields(re);
  }

  return re;
}
