// use-markdown-front-matter.ts
import YAML from 'js-yaml';
import _ from 'lodash';
import type MarkdownIt from 'markdown-it';
import type { PluginWithOptions } from 'markdown-it';

export type FrontMatterRenderType = 'none' | 'table' | 'list';
export type FrontMatterCallback = (frontMatter: Record<string, any>) => void;

export interface MarkdownItFrontMatterOptions {
  renderAs?: FrontMatterRenderType;
  callback?: FrontMatterCallback;
}

const frontMatterPlugin: PluginWithOptions<MarkdownItFrontMatterOptions> = (
  md: MarkdownIt,
  options: MarkdownItFrontMatterOptions = {}
) => {
  const { renderAs = 'none', callback } = options;

  /**
   * ## 添加前置处理规则，识别并移除 front matter
   *
   * 插件核心：前置处理规则，用于识别并移除 Markdown 文档中的 front matter 部分。
   *
   * 工作流程：
   *
   * 1. 通过正则表达式 `/^-{3,}\r?\n([\s\S]+?)\r?\n-{3,}\r?\n/` 匹配 front matter 块。
   *    - 如果未匹配到（即 front matter 不存在），则返回 `false`。
   *    - 返回 `false` 表示此规则未处理内容，Markdown-it 将继续执行后续的规则。
   *
   * 2. 如果匹配成功，尝试解析 front matter 内容（YAML 格式）。
   *    - 如果解析成功，则调用配置的回调函数（如果提供的话）返回解析结果。
   *    - 如果配置了 `renderAs` 参数且不为 'ignore'，则创建一个新的 token 将 front matter 信息保存下来，
   *      以便后续渲染时根据指定方式（table 或 list）展示这一信息。
   *
   * 3. 无论解析成功与否，从 `state.src` 中移除 front matter 部分。
   *    - 返回 `true` 表示当前规则已处理内容，Markdown-it 将基于修改后的 `state.src` 继续执行后续规则。
   *
   * 返回值说明：
   * - `return false`：表示未处理任何内容，流程将继续由其他规则处理该文档内容。
   * - `return true`：表示当前规则已处理 front matter 数据，并修改了 `state.src`，
   *                 后续的渲染流程将基于处理后的内容进行渲染。
   */
  md.core.ruler.before('normalize', 'front_matter', (state) => {
    const match = state.src.match(/^-{3,}\r?\n([\s\S]+?)\r?\n-{3,}\r?\n/);
    if (!match) return false;

    // 提取 front matter
    try {
      const frontMatter = YAML.load(match[1]) as Record<string, any>;
      callback?.(frontMatter);

      // 使用前置词储存 front matter 数据
      if (renderAs !== 'none') {
        const token = new state.Token('front_matter', '', 0);
        token.content = match[1];
        token.meta = frontMatter;
        token.block = true;
        state.tokens.push(token);
      }

      // 移除 front matter 部分
      state.src = state.src.slice(match[0].length);
    } catch (e) {
      console.warn('Failed to parse front matter:', e);
    }

    return true;
  });

  // 添加渲染规则
  md.renderer.rules.front_matter = (tokens, idx) => {
    const token = tokens[idx];
    // 仅取token.meta，不做额外解析
    const data = token.meta;
    if (_.isEmpty(data)) return '';

    switch (renderAs) {
      case 'table':
        return renderAsTable(data);
      case 'list':
        return renderAsList(data);
      case 'none':
      default:
        return '';
    }
  };
};

function renderAsTable(data: Record<string, any>): string {
  const rows = Object.entries(data)
    .map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`)
    .join('');
  return `<table class="front-matter-table">${rows}</table>`;
}

function renderAsList(data: Record<string, any>): string {
  const items = Object.entries(data)
    .map(
      ([key, value]) =>
        `<li><strong>${key}:</strong> <span>${value}</span></li>`
    )
    .join('');
  return `<ul class="front-matter-list">${items}</ul>`;
}

export const markdownItFrontMatterPlugin = frontMatterPlugin;
