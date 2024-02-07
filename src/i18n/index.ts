import { I18n, I18nSet, MessageMap } from '@site0/tijs';
import en_us from './en-us.json';
import zh_cn from './zh-cn.json';

export function installWalnutI18n(lang: string) {
  let cn = zh_cn as MessageMap;
  let en = en_us as MessageMap;

  const app_i18ns = {
    zh_cn: cn,
    en_us: en,
    zh_hk: cn,
    en_uk: en,
  } as I18nSet;

  let langKey = I18n.toLangKey(lang);
  I18n.putAll(app_i18ns[langKey]);
}
