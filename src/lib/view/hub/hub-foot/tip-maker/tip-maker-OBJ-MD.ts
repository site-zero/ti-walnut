import { Alg, HtmlSnippetProps, I18n, TipBoxProps } from '@site0/tijs';
import { FootTipMaker } from '../use-hub-foot-tips';

export const tip_maker_OBJ_MD: FootTipMaker = (
  ctx,
  value,
  rawValue,
  title
): undefined | TipBoxProps => {
  console.log(ctx, value, title);
  if (!rawValue) {
    return;
  }
  let info = Alg.parseObjMode(value);

  // 准备获取字段名的函数
  const TT = (key: string) => I18n.get('wn-hub-foot-obj-md-' + key);

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
    background-color: var(--ti-color-body);
    color: var(--ti-color-body-f);
    text-align: right;
}
article[data-${scope}] > table td:last-child {
    font-family: Monaco, Consolas, Courier New;
}
</style>
<article data-${scope}>
<table cell-spacing="0"">
${titleHtml}
<tbody>
    <tr><td nowrap>${TT('val')}</td><td>${info.val}</td></tr>
    <tr><td nowrap>${TT('oct')}</td><td>${info.oct}</td></tr>
    <tr><td nowrap>${TT('mod')}</td><td>${info.mod}</td></tr>
    <tr><td nowrap>${TT('owner')}</td><td>${info.owner}</td></tr>
    <tr><td nowrap>${TT('group')}</td><td>${info.group}</td></tr>
    <tr><td nowrap>${TT('other')}</td><td>${info.other}</td></tr>
</tbody></table></article>
`,
    } as HtmlSnippetProps,
  };
};
