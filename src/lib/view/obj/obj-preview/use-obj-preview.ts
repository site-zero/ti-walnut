import { Ref } from 'vue';
import { Walnut } from '../../../../core';
import { WnObjPreivewInfo, WnObjPreviewProps } from './wn-obj-preview-types';
import { WnObj } from '../../../_types';

export function getObjPreviewInfo(props: WnObjPreviewProps): WnObjPreivewInfo {
  let { id, race, mime } = props.value ?? {};
  if (!race || !id) {
    return { type: 'none', src: '' };
  }

  if ('DIR' == race) {
    return { type: 'folder', src: '' };
  }

  // /o/content?str=id:3c..8c&d=(auto|force|raw）
  let src = Walnut.getUrl(`/o/content?str=id:${id}&d=`);

  // 不知道什么类型，就直接下载了
  if (!mime) {
    return { type: 'binary', src: [src, 'auto'].join('') };
  }

  // 网页
  if ('text/html' == mime) {
    return { type: 'html', src: [src, 'raw'].join('') };
  }

  // JSON
  if (
    'text/json' == mime ||
    'application/json' == mime ||
    'text/json5' == mime ||
    'application/json5' == mime
  ) {
    return { type: 'json', src: `cat id:${id}` };
  }

  // 文本
  if (/^text\//.test(mime)) {
    return { type: 'text', src: `cat id:${id}` };
  }

  // 图片
  if (/^image\//.test(mime)) {
    return { type: 'image', src: [src, 'raw'].join('') };
  }

  // 音频
  if (/^audio\//.test(mime)) {
    return { type: 'audio', src: [src, 'raw'].join('') };
  }

  // 视频
  if (/^video\//.test(mime)) {
    return { type: 'video', src: [src, 'raw'].join('') };
  }

  // 默认当作二进制
  return { type: 'binary', src: [src, 'auto'].join('') };
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
