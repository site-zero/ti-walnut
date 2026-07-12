import { Alg, Util, Vars } from "@site0/tijs";
import JSON5 from "json5";
import _ from "lodash";

export function gen_wn_obj_title_tip_html(obj: Vars): string {
  let meta = Util.jsonClone(obj);
  if (_.isString(meta.local)) {
    meta.local = JSON5.parse(meta.local);
  }
  // 准备一个随机数用作 scope
  let scope = Alg.genSnowQ(6);
  const html = [];
  // 添加 CSS
  html.push(`<style>
      table[data-scope="${scope}"] {
        font-size: var(--ti-fontsz-s);
      }
      table[data-scope="${scope}"] th {
        font-size: inherit;
        font-weight: normal;
        text-align: right;
        color: var(--ti-color-info-r);
      }
      table[data-scope="${scope}"] code {
        font-family: Monaco, Consolas, Courier New;
        font-size: 0.8em;
        color: var(--ti-color-info);
      }
      table[data-scope="${scope}"] td {
        font-size: inherit;
        font-family: Monaco, Consolas, Courier New;
        background-color: var(--ti-color-mask-weak)
      }
    </style>`);
  // 添加字段函数
  const _add_field = (name: string, text: string) => {
    let val = _.get(meta, name);
    if (_.isNil(val)) return;
    html.push(`<tr>
        <th>${text}:</th>
        <!--td><code>${name}</code></td-->
        <td>${val}</td>
      </tr>`);
  };
  html.push(`<table data-scope="${scope}"><tbody>`);
  _add_field("title", "Title");
  _add_field("nm", "Name");
  _add_field("local.name", "Local Name");
  _add_field("lbls", "Labels");
  _add_field("tp", "Type");
  _add_field("mime", "MIME");
  _add_field("len", "Size");
  _add_field("sha1", "SHA-1");
  html.push("</tbody></table>");
  return html.join("\n");
}
