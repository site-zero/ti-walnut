import {
  Alg,
  DateTime,
  ENV_KEYS,
  getEnv,
  HtmlSnippetProps,
  I18n,
  TipBoxProps,
  Util,
} from '@site0/tijs';
import _ from 'lodash';
import { GlobalStatus, UserSession } from '../../..';

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
  _makers['DT-UTC'] = (
    ctx: FootValueContext,
    value: any,
    rawValue: any,
    title?: string
  ) => {
    if (!rawValue) {
      return;
    }
    // 传入的是一个 UTC 时间戳, 先转换为日期对象
    let d = new Date(rawValue + 'Z');
    // 根据时区获取会话的时间
    let utcTime = rawValue;
    let localTime = '---';
    let timezone = ctx.session.env.TIMEZONE ?? '---';
    let m = /^(GMT|UTC)([+-]\d{1,2})$/.exec(timezone);
    if (value && m) {
      let format = getEnv(
        ENV_KEYS.DFT_DATETIME_FORMAT,
        'yyyy-MM-dd HH:mm:ss'
      ) as string;
      let offset = parseInt(m[2]);
      localTime = DateTime.format(d, { fmt: format, timezone: offset });
      utcTime = DateTime.format(d, { fmt: format, timezone: 'Z' });
    }

    // 准备获取字段名的函数
    const TT = (key: string) => I18n.get('wn-hub-foot-dt-utc-' + key);

    // 准备标题
    let titleHtml = '';
    if (title) {
      titleHtml = `<caption>
        <i class="fa-solid fa-calendar"></i>
        &nbsp;&nbsp;
        <span>${I18n.text(title)}</span>
      </caption>`;
    }

    // 准备一个随机数用作 scope
    let scope = Alg.genSnowQ(6);

    return {
      comType: 'TiHtmlSnippet',
      comConf: {
        content: `<article data-${scope}>
        <table cell-spacing="0"">
        ${titleHtml}
        <tbody>
            <tr><td nowrap>${TT('display')}</td><td>${value}</td></tr>
            <tr><td nowrap>${TT('utc')}</td><td>${utcTime}</td></tr>
            <tr><td nowrap>${TT('local')}</td><td>${localTime}</td></tr>
            <tr><td nowrap>${TT('tz')}</td><td>${timezone}</td></tr>
            <tr><td nowrap>${TT('db')}</td><td>${rawValue}</td></tr>
            <tr><td nowrap>${TT('browser')}</td><td nowrap>${d}</td></tr>
        </tbody></table></article>`,
        styleSheet: [
          {
            selectors: [`article[data-${scope}] > table`],
            rules: {
              borderCollapse: 'collapse',
            },
          },
          {
            selectors: [`article[data-${scope}] > table > caption`],
            rules: {
              padding: '1em',
              fontWeight: 'bold',
            },
          },
          {
            selectors: [`article[data-${scope}] > table td`],
            rules: {
              padding: '0.6em 1em',
              whiteSpace: 'nowrap',
            },
          },
          {
            selectors: [`article[data-${scope}] > table td:first-child`],
            rules: {
              backgroundColor: 'var(--ti-color-body)',
              color: 'var(--ti-color-body-f)',
              textAlign: 'right',
            },
          },
          {
            selectors: [`article[data-${scope}] > table td`],
            rules: {
              border: '1px solid var(--ti-color-border-dark)',
            },
          },
        ],
      } as HtmlSnippetProps,
    };
  };

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
