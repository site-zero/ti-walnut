import { Ref } from 'vue';
import { GetUrlForObjContentOptions, Walnut } from '../../../../core';
import { WnObj } from '../../../_types';
import { WnObjPreivewInfo, WnObjPreviewProps } from './wn-obj-preview-types';

export function getObjPreviewInfo(props: WnObjPreviewProps): WnObjPreivewInfo {
  let { id, race, mime } = props.value ?? {};
  if (!race || !id) {
    return { type: 'none', src: '' };
  }

  if ('DIR' == race) {
    return { type: 'folder', src: '' };
  }

  // /o/content?str=id:3c..8c&d=(auto|force|raw）
  let down: GetUrlForObjContentOptions = {
    withTicket: true,
    download: 'auto',
  };

  // 默认当作二进制
  let info: WnObjPreivewInfo = {
    type: 'binary',
    src: '',
  };

  // 不知道什么类型，就直接下载了
  if (!mime) {
    down.download = 'auto';
  }
  // 网页 & PDF
  else if (/^(text\/html)|(application\/pdf)$/.test(mime)) {
    info.type = 'html';
    down.download = 'raw';
  }
  // JSON
  else if (
    'text/json' == mime ||
    'application/json' == mime ||
    'text/json5' == mime ||
    'application/json5' == mime
  ) {
    info.type = 'json';
    info.src = `cat id:${id}`;
  }
  // 文本
  else if (/^text\//.test(mime)) {
    info.type = 'text';
    info.src = `cat id:${id}`;
  }
  // 图片
  else if (/^image\//.test(mime)) {
    info.type = 'image';
    down.download = 'raw';
  }
  // 音频
  else if (/^audio\//.test(mime)) {
    info.type = 'audio';
    down.download = 'raw';
  }
  // 视频
  if (/^video\//.test(mime)) {
    info.type = 'video';
    down.download = 'raw';
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
  if (/^(json|text)$/.test(info.type)) {
    _text.value = await Walnut.exec(info.src);
  } else {
    _text.value = '';
  }
}

export function getObjCodeType(meta: WnObj) {
  let { mime, race } = meta;
  if ('FILE' != race) {
    return;
  }
  if (!mime) {
    return 'language-text';
  }
  return (
    {
      'application/json': 'language-json',
      'application/json5': 'language-json5',
      'application/x-javascript': 'language-javascript',
      'text/css': 'language-css',
      'text/html': 'language-html',
      'text/iuls': 'language-uls',
      'text/json': 'language-json',
      'text/json5': 'language-json5',
      'text/less': 'language-less',
      'text/markdown': 'language-md',
      'text/plain': 'language-text',
      'text/richtext': 'language-rtx',
      'text/sass': 'language-sass',
      'text/scriptlet': 'language-sct',
      'text/sgml': 'language-sgml',
      'text/tab-separated-values': 'language-tsv',
      'text/vbscript': 'language-vbs',
      'text/vtt': 'language-vtt',
      'text/webviewhtml': 'language-htt',
      'text/x-hdml': 'language-hdml',
      'text/x-setext': 'language-etx',
      'text/x-vcard': 'language-vcf',
      'text/xml': 'language-xml',
    }[mime as string] || 'language-text'
  );
}
