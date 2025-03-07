import { Vars } from '@site0/tijs';
import MarkdownIt from 'markdown-it';
import {
  MarkdownItFrontMatterOptions,
  markdownItFrontMatterPlugin,
} from './use-markdown-front-matter.ts';
import { WnObjPreivewInfo } from './wn-obj-preview-types';

export function renderMarkdown(
  info: WnObjPreivewInfo,
  content: string
): string {
  if (!content || info.type != 'markdown') return '';
  const md = new MarkdownIt();
  md.use(markdownItFrontMatterPlugin, {
    renderAs: 'list',
    callback: (preface: Vars) => {
      console.log('这里是解析出来的前言', preface);
    },
  } as MarkdownItFrontMatterOptions);
  return md.render(content);
}
