import { appendPath, Iconable, IconInput, Icons } from '@site0/tijs';
import { WnObj } from '../lib/_types';

export function I_am_walnut(input: any) {
  console.log('I am walnut', input);
  return input;
}

export function getWnObjIcon(obj?: WnObj, dft?: IconInput): IconInput {
  let _icon: string | Iconable | undefined;
  if (obj) {
    _icon = {
      tp: obj.tp,
      mime: obj.mime,
      race: obj.race,
      icon: obj.icon,
    };
  }
  return Icons.getIcon(_icon, dft);
}

export function safeCmdArg(arg: string) {
  return arg.replaceAll(/['";]/g, '');
}

export function genWnPath(base: string, subPath?: string) {
  let re: string;
  // 采用基础路径
  if (!subPath) {
    re = base;
  }
  // 指定了绝对子路径
  else if (/^(id:|~\/|\/)/.test(subPath)) {
    re = subPath;
  }
  // 拼合路径
  else {
    re = appendPath(base, subPath);
  }
  return safeCmdArg(re);
}
