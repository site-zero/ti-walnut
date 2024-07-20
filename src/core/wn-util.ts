import { Iconable, IconInput, Icons } from '@site0/tijs';
import { WnObj } from '../lib/_top';

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
