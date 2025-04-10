import { TipBoxProps, Util } from '@site0/tijs';
import _ from 'lodash';
import { GlobalStatus, UserSession } from '../../..';
import { tip_maker_DT_UTC } from './tip-maker/tip-maker-DT-UTC';
import { tip_maker_OBJ_MD } from './tip-maker/tip-maker-OBJ-MD';
import { tip_maker_OBJ_TSMS } from './tip-maker/tip-maker-OBJ-TSMS';

export type FootValueContext = {
  G: GlobalStatus;
  session: UserSession;
};

export type FootTipMaker = (
  ctx: FootValueContext,
  value: any,
  rawValue: any,
  title?: string
) => undefined | TipBoxProps;

export type HubFootTipsProps = {
  /**
   * 模块内置了下面的 tipMakers
   *
   * - `DT-UTC` : 显示本地时区的时间，同时也显示 UTC 时间
   */
  tipMakers?: Record<string, FootTipMaker>;
};

/**
 * 一个 React Hook，用于处理 HubFoot 的提示信息。
 *
 * @param props - 包含提示信息生成器的属性。
 * @returns 一个函数，该函数接受提示类型、上下文、显示值和原始值，
 * 并返回一个 TipBoxProps 对象或 undefined。
 */
export function useHubFootTips(props: HubFootTipsProps) {
  const _makers: Record<string, FootTipMaker> = {};

  // 内置: 输入的值是一个 UTC 时间戳
  // 值类似  2024-12-13 12:07:32.268
  _makers['DT-UTC'] = tip_maker_DT_UTC;
  _makers['OBJ-TSMS'] = tip_maker_OBJ_TSMS;
  _makers['OBJ-MD'] = tip_maker_OBJ_MD;

  // 用户自定义的 tipMaker
  if (props.tipMakers) {
    _.assign(_makers, props.tipMakers);
  }

  return (
    tip: string | Partial<TipBoxProps> | undefined,
    ctx: FootValueContext,
    value: any,
    rawValue: any
  ) => {
    // if (/^->Shipment/.test(tip?.content as string)) {
    //   console.log(tip, value);
    // }
    if (!tip || _.isNil(rawValue)) {
      return;
    }

    // 采用 Maker 的方式
    if (_.isString(tip)) {
      let [func_name, title] = tip.split('=');
      let make = _makers[func_name];
      if (!make) {
        console.warn(`TipMaker ${tip} not found!`);
        return;
      }
      return make(ctx, value, rawValue, title);
    }

    // 那么就是模板方式
    return Util.explainObj(
      {
        ...ctx,
        value,
        rawValue,
      },
      tip
    );
  };
}
