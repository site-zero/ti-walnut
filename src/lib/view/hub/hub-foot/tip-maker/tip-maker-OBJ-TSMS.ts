import { Alg, HtmlSnippetProps, I18n, Icons, TipBoxProps } from '@site0/tijs';
import { FootTipMaker } from '../use-hub-foot-tips';

export const tip_maker_OBJ_TSMS: FootTipMaker = (
  ctx,
  _value,
  rawValue,
  title
): undefined | TipBoxProps => {
  if (!rawValue) {
    return;
  }
  let obj = ctx.G.currentObj ?? {};
  let { mime, tp, sha1, len } = obj;
  let objIcon = Icons.getIcon(obj);
  let objIconObj = Icons.toIconObj(objIcon);
  let objIconHtml = Icons.fontIconHtml(objIconObj);

  // 准备获取字段名的函数
  const TT = (key: string) => I18n.get('wn-hub-foot-obj-' + key);

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
<table cell-spacing="0"">
${titleHtml}
<tbody>
    <tr><td nowrap>${TT('tp')}</td><td>${objIconHtml} ${tp}</td></tr>
    <tr><td nowrap>${TT('mime')}</td><td>${mime}</td></tr>
    <tr><td nowrap>${TT('sha1')}</td><td>${sha1}</td></tr>
    <tr><td nowrap>${TT('len')}</td><td>${len}Bytes</td></tr>
</tbody></table></article>
`,
    } as HtmlSnippetProps,
  };
};
