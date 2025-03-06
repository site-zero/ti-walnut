import { appendPath, Iconable, IconInput, Icons } from '@site0/tijs';
import { WnObj, WnObjContentFinger } from '../lib/_types';

/**
 * 对命令行参数进行安全处理，移除所有单引号、双引号和分号，防止命令注入。
 *
 * @param arg 要进行安全处理的命令行参数字符串。
 * @returns 移除单引号、双引号和分号后的安全字符串。
 */
export function safeCmdArg(arg: string) {
  return arg.replaceAll(/['";]/g, '');
}

/**
 * 获取 WnObj 的图标。
 *
 * @param obj WnObj 对象
 * @param dft 默认图标
 * @returns 图标信息
 */
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

/**
 * 生成安全的 Walnut 路径。
 *
 * @param base 基础路径
 * @param subPath 子路径
 * @returns 安全的 Walnut 路径
 */
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

export function getObjContentFinger(obj: WnObj): WnObjContentFinger {
  let { id, len, sha1, mime, tp } = obj;
  return { id, len, sha1, mime, tp };
}

export function isObjContentEditable(obj: WnObj): boolean {
  if ('DIR' === obj.race) {
    return false;
  }
  let { mime = '' } = obj ?? {};
  return (
    /^text\//.test(mime) ||
    /^application\/(java|json5?|(x-)?javascript)/.test(mime)
  );
}
