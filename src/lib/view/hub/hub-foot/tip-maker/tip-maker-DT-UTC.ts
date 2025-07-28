import {
  Alg,
  DateTime,
  ENV_KEYS,
  getEnv,
  HtmlSnippetProps,
  I18n,
  TipBoxProps,
} from '@site0/tijs';
import { FootTipMaker } from '../use-hub-foot-tips';
import _ from 'lodash';

export const tip_maker_DT_UTC: FootTipMaker = (
  ctx,
  value,
  rawValue,
  title
): undefined | TipBoxProps => {
  if (!rawValue) {
    return;
  }
  let d: Date;
  // 直接给的是绝对毫秒
  if (_.isNumber(rawValue)) {
    d = new Date(rawValue);
  }
  // 传入的是一个 UTC 时间戳, 先转换为日期对象
  else {
    d = new Date(rawValue + 'Z');
  }
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
      content: `
<style>
article[data-${scope}] > table {
    border-collapse: collapse;
}
article[data-${scope}] > table > caption {
    padding: 1em;
    font-weight: bold;
}
article[data-${scope}] > table td {
    padding: 0.6em 1em;
    white-space: nowrap;
    border: 1px solid var(--ti-color-border-dark);
}
article[data-${scope}] > table td:first-child {
    color: var(--ti-color-bar-f);
    text-align: right;
}
article[data-${scope}] > table td:last-child {
    font-family: Monaco, Consolas, Courier New;
}
</style>
<article data-${scope}>
<table cell-spacing="0">
${titleHtml}
<tbody>
    <tr><td nowrap>${TT('display')}</td><td>${value}</td></tr>
    <tr><td nowrap>${TT('utc')}</td><td>${utcTime}</td></tr>
    <tr><td nowrap>${TT('local')}</td><td>${localTime}</td></tr>
    <tr><td nowrap>${TT('tz')}</td><td>${timezone}</td></tr>
    <tr><td nowrap>${TT('db')}</td><td>${rawValue}</td></tr>
    <tr><td nowrap>${TT('browser')}</td><td nowrap>${d}</td></tr>
    <tr><td nowrap>${TT('ams')}</td><td nowrap>${d.getTime()}</td></tr>
</tbody></table></article>
`,
    } as HtmlSnippetProps,
  };
};
