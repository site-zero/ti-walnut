import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const referenceDir = path.join(root, "doc", "reference");
const errors = [];
const statusCount = { draft: 0, done: 0, deprecated: 0 };

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : target.endsWith(".md") ? [target] : [];
  });
}

function posix(value) {
  return value.split(path.sep).join("/");
}

const files = walk(referenceDir);
const indexPath = path.join(referenceDir, "INDEX.md");
const indexText = readFileSync(indexPath, "utf8");

for (const file of files) {
  const relative = posix(path.relative(referenceDir, file));
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);

  const frontMatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontMatter) {
    errors.push(`${relative}: 缺少 YAML front-matter`);
  } else {
    const meta = frontMatter[1];
    if (!/^title:\s*\S+/m.test(meta)) errors.push(`${relative}: 缺少 title`);
    if (!/^keywords:\s*\[[^\]]+\]/m.test(meta)) errors.push(`${relative}: keywords 必须是非空行内数组`);
    const status = meta.match(/^status:\s*(draft|done|deprecated)\s*$/m)?.[1];
    if (!status) errors.push(`${relative}: status 必须为 draft | done | deprecated`);
    else statusCount[status] += 1;
  }

  if (!lines.some((line) => /^#\s+\S+/.test(line))) {
    errors.push(`${relative}: 缺少 H1 标题`);
  }

  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    let target = match[1].trim().replace(/^<|>$/g, "");
    if (/^(?:[a-z]+:|\/|#)/i.test(target)) continue;
    target = decodeURIComponent(target.split("#")[0]);
    if (!target) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!existsSync(resolved)) errors.push(`${relative}: 死链 ${match[1]}`);
  }

  for (const match of text.matchAll(/`(src\/[A-Za-z0-9_./-]+)`/g)) {
    const sourcePath = match[1];
    if (!existsSync(path.join(root, sourcePath))) {
      errors.push(`${relative}: 源码路径不存在 ${sourcePath}`);
    }
  }

  if (relative !== "INDEX.md" && relative !== "SOURCEMAP.md") {
    const linked = indexText.includes(`](${relative})`) || indexText.includes(`](${relative}#`);
    if (!linked) errors.push(`${relative}: 未收录到 INDEX.md`);
  }
}

if (errors.length > 0) {
  console.error(`文档检查失败，共 ${errors.length} 项：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `文档检查通过：${files.length} 篇；done ${statusCount.done}，draft ${statusCount.draft}，deprecated ${statusCount.deprecated}。`
  );
}
