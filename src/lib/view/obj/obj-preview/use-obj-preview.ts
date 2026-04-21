import { GetUrlForObjContentOptions, Walnut, WnObj } from "@site0/ti-walnut";
import { Ref } from "vue";
import { WnObjPreivewInfo, WnObjPreviewProps } from "./wn-obj-preview-types";

export function getObjDownloadName(obj: WnObj): string {
  let { nm, title, tp } = obj;
  let downName = nm;
  if (title) {
    if (!title.endsWith(`.${tp}`)) {
      downName = [title, tp].join(".");
    } else {
      downName = title;
    }
  }
  return downName;
}

export function getObjPreviewInfo(props: WnObjPreviewProps): WnObjPreivewInfo {
  let obj = props.value ?? {};
  let { id, race, mime } = obj;
  if (!race || !id) {
    return { type: "none", src: "", downloadLink: "#" };
  }

  if ("DIR" == race) {
    return { type: "folder", src: "", downloadLink: "#" };
  }

  // 计算下载名称
  let downName = getObjDownloadName(obj);

  // /o/content?str=id:3c..8c&d=(auto|force|raw）
  let down: GetUrlForObjContentOptions = {
    withTicket: true,
    download: "auto",
  };

  // 默认当作二进制
  let info: WnObjPreivewInfo = {
    type: "binary",
    src: "",
    showTopMenu: true,
    downloadLink: Walnut.getUrlForObjContent(id, {
      download: "force",
      downName,
      withTicket: true,
    }),
  };

  // 不知道什么类型，就直接下载了
  if (!mime) {
    down.download = "auto";
    info.showTopMenu = false;
  }
  // 网页
  else if (/^(text\/html)$/.test(mime)) {
    info.type = "html";
    down.download = "raw";
  }
  // PDF
  else if (/^(application\/pdf)$/.test(mime)) {
    info.type = "pdf";
    info.showTopMenu = false;
    down.download = "raw";
    down.downName = downName;
  }
  // JSON
  else if (
    "text/json" == mime ||
    "application/json" == mime ||
    "text/json5" == mime ||
    "application/json5" == mime
  ) {
    info.type = "json";
    info.src = `cat id:${id}`;
  }
  // Markdown
  else if ("text/markdown" == mime) {
    info.type = "markdown";
    info.src = `cat id:${id}`;
  }
  // 文本
  else if (
    /^text\//.test(mime) ||
    /^application\/(x-)?javascript|sql/.test(mime)
  ) {
    info.type = "text";
    info.src = `cat id:${id}`;
  }
  // 图片
  else if (/^image\//.test(mime)) {
    info.type = "image";
    down.download = "raw";
  }
  // 音频
  else if (/^audio\//.test(mime)) {
    info.type = "audio";
    down.download = "raw";
  }
  // 视频
  else if (/^video\//.test(mime)) {
    info.type = "video";
    down.download = "raw";
  }
  // 其他默认，就是下载信息
  else {
    info.showTopMenu = false;
  }

  // 补完 src
  if (!info.src) {
    info.src = Walnut.getUrlForObjContent(id, down);
  }
  return info;
}

export async function loadTextPreviewContent(
  info: WnObjPreivewInfo,
  _text: Ref<string>
) {
  // 文本内容
  if (/^(json|text|markdown)$/.test(info.type)) {
    _text.value = await Walnut.exec(info.src);
  }
  // 没内容
  else {
    _text.value = "";
  }
}

export function getObjCodeType(meta: WnObj) {
  let { mime, race } = meta;
  if ("FILE" != race) {
    return;
  }
  if (!mime) {
    return "language-text";
  }
  return (
    {
      "application/json": "language-json",
      "application/json5": "language-json5",
      "application/x-javascript": "language-javascript",
      "application/javascript": "language-javascript",
      "text/css": "language-css",
      "text/html": "language-html",
      "text/iuls": "language-uls",
      "text/json": "language-json",
      "text/json5": "language-json5",
      "text/less": "language-less",
      "text/sql": "language-sql",
      "text/markdown": "language-md",
      "text/plain": "language-text",
      "text/richtext": "language-rtx",
      "text/sass": "language-sass",
      "text/scriptlet": "language-sct",
      "text/sgml": "language-sgml",
      "text/tab-separated-values": "language-tsv",
      "text/vbscript": "language-vbs",
      "text/vtt": "language-vtt",
      "text/webviewhtml": "language-htt",
      "text/x-hdml": "language-hdml",
      "text/x-setext": "language-etx",
      "text/x-vcard": "language-vcf",
      "text/xml": "language-xml",
    }[mime as string] || "language-text"
  );
}
