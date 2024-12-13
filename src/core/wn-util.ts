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
  if (!subPath) {
    return base.replaceAll(/['";]/g, '');
  }
  if (/^(id:|~\/|\/)/.test(subPath)) {
    return subPath.replaceAll(/['";]/g, '');
  }
  return appendPath(base, subPath).replaceAll(/['";]/g, '');
}
