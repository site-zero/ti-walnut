import MarkdownIt from 'markdown-it';
//import markdownItFrontMatter from 'markdown-it-front-matter';
import { WnObjPreivewInfo } from './wn-obj-preview-types';

/*
 手动修改类型定义文件：若更新插件无法解决问题，
 你可以手动修改 node_modules/markdown-it-front-matter/index.d.ts 文件，
 把 import MarkdownIt from 'markdown-it/lib' 
 改为 import MarkdownIt from 'markdown-it'。
 */

const md = new MarkdownIt();
// md.use(markdownItFrontMatter, (frontMatter: string) => {
//   console.log('frontMatter', frontMatter);
// });

export function renderMarkdown(
  info: WnObjPreivewInfo,
  content: string
): string {
  if (!content || info.type != 'markdown') return '';
  return md.render(content);
}
