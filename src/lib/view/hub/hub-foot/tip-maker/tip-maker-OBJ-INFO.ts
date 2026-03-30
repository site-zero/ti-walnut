import {
  Alg,
  Be,
  Dom,
  HtmlSnippetProps,
  I18n,
  Icons,
  TipBoxProps,
  Vars,
} from "@site0/tijs";
import JSON5 from "json5";
import _ from "lodash";
import { FootTipMaker } from "../use-hub-foot-tips";

export const tip_maker_OBJ_INFO: FootTipMaker = (
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
  const TT = (key: string) => I18n.get("wn-obj-" + key, _.upperCase(key));

  // 准备标题
  let titleHtml = "";
  if (title) {
    titleHtml = `<caption>
            <i class="fa-solid fa-calendar"></i>
            &nbsp;&nbsp;
            <span>${I18n.text(title)}</span>
          </caption>`;
  }

  // 循环对象字段，收集标准字段，其他非标准字段将收缩到一个 JSON 对象里
  let stdFields: Vars = {};
  let moreMeta: Vars = {};
  for (let key of _.keys(obj)) {
    // 非标准字段收缩到一个 JSON 对象里
    if (
      !/^(id|nm|title|icon|thumb|race|tp|mime|len|sha1|ct|lm|expi|c|g|m|md|d[01])$/.test(
        key
      )
    ) {
      let val = obj[key];
      if (!_.isNil(val)) {
        moreMeta[key] = obj[key];
      }
      continue;
    }
    // 其他的字段逐个打印
    if ("tp" === key) {
      stdFields[key] = `<tr><td nowrap>${TT(
        "tp"
      )}</td><td>${objIconHtml} ${tp}</td></tr>`;
    }
    // 直接写值
    else {
      stdFields[key] = `<tr><td nowrap>${TT(key)}</td><td>${
        obj[key]
      }</td></tr>`;
    }
  }

  // 根据指定顺序输出
  let infoHtml = [];
  let infoKeys = [
    "id",
    "nm",
    "title",
    "icon",
    "thumb",
    "race",
    "tp",
    "mime",
    "len",
    "sha1",
    "ct",
    "lm",
    "expi",
    "c",
    "g",
    "m",
    "md",
    "d0",
    "d1",
  ];

  // Generate HTML rows for each standard field in order
  for (let key of infoKeys) {
    if (key in stdFields) {
      infoHtml.push(stdFields[key]);
    }
  }
  // 最后附加上更多 JSON
  if (!_.isEmpty(moreMeta)) {
    infoHtml.push(
      `<tr><td style="padding:0; position:relative" nowrap colspan="2">
      <button class="foot-more-info-copy" style="
      position:absolute; top:6px; right:16px; width:24px; height:24px;
      padding:0; text-align:center; line-height:24px;
      "><i class="fa-solid fa-copy"></i></button>
      <pre style="max-height: 20em; padding:0.5em; overflow: auto;"
      >${JSON5.stringify(
        moreMeta,
        function (k, v) {
          if (!k) return v;
          if (_.isNil(v)) return undefined;
          if (_.isString(v) && v.length > 32) {
            return v.substring(0, 30) + "...";
          }
          return v;
        },
        2
      )}</pre></td></tr>`
    );
  }

  // 准备一个随机数用作 scope
  let scope = Alg.genSnowQ(6);

  return {
    comType: "TiHtmlSnippet",
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
article[data-${scope}] > table pre {
    text-align: left;
    margin:0;
    padding:1em;
}
</style>
<article data-${scope}>
<table cell-spacing="0"">
${titleHtml}
<tbody>
    ${infoHtml.join("\n")}
</tbody></table></article>`,
      listenners: [
        {
          selector: "table button.foot-more-info-copy",
          eventName: "click",
          handler: (_emit, evt) => {
            let $btn = evt.target as HTMLElement;
            let $td = Dom.closest($btn, "td");
            let json = JSON.stringify(obj, null, 2);
            Be.Clipboard.write(json);
            Be.BlinkIt($td);
          },
        },
      ],
    } as HtmlSnippetProps,
  };
};
