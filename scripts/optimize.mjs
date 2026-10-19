import { existsSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { fail, root as projectRoot, runMain } from "./utils-cli.mjs";
import { filesIn } from "./utils-fs.mjs";

const CONVERTIBLE = /\.(?:png|jpe?g)$/i;
const RAW_BACKUP = /\.raw\.(?:png|jpe?g)$/i;
const TEXT_FILE = /\.(?:md|mdx|json|ya?ml|html?|vue|ts|mts|js|mjs)$/i;
const REMOTE = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/**
 * 只匹配站点内的图片路径，避免把正文里的普通英文单词当成资源。
 * 图片扩展名后再排除字母数字，防止匹配到 `.pngx` 之类的无关键。
 */
const URL_PATTERN = /[A-Za-z0-9._~%/@+,:;=!$&*\-\\]+\.(?:png|jpe?g)(?![a-z0-9])/gi;

export const DEFAULT_THRESHOLD = 300 * 1024;
export const DEFAULT_QUALITY = 82;

const USAGE = `用法：
  pnpm optimize [--threshold 300kb] [--quality 82] [--dry-run]

把大于阈值的 PNG / JPEG 图片转成 WebP：
  1. 原图重命名为 <name>.raw.<ext>，留在原目录；
  2. 生成 <name>.webp；
  3. 自动更新 docs / data / .vitepress 中的图片引用。

默认阈值 300 KB，JPEG 使用有损 WebP，PNG 使用无损 WebP。
转换后如果没有变小，会放弃转换并保留原图。`;

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function show(file, root) {
  return relative(root, file).replaceAll("\\", "/");
}

function parseThreshold(value) {
  const match = /^(\d+(?:\.\d+)?)\s*(b|kb|mb)?$/i.exec(value);
  if (!match) fail(`无法解析图片阈值：${value}`);

  const unit = (match[2] ?? "b").toLowerCase();
  const multiplier = unit === "mb" ? 1024 ** 2 : unit === "kb" ? 1024 : 1;
  return Math.round(Number(match[1]) * multiplier);
}

function parseQuality(value) {
  const quality = Number(value);
  if (!Number.isInteger(quality) || quality < 1 || quality > 100) fail(`WebP 质量必须是 1-100 的整数：${value}`);
  return quality;
}

function readOption(args, name) {
  const inline = args.find((argument) => argument.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);

  const index = args.indexOf(name);
  if (index !== -1) {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) fail(`${name} 缺少参数值`);
    return value;
  }
  return undefined;
}

function listFiles(directory) {
  return existsSync(directory) ? filesIn(directory) : [];
}

function isSkipped(file, skipped) {
  return skipped.some((directory) => file === directory || file.startsWith(`${directory}${sep}`));
}

function resolveReference(token, source, conversions, root) {
  let path = token.split(/[?#]/, 1)[0];
  try {
    path = decodeURIComponent(path);
  } catch {
    // 解码失败时按原样解析。
  }

  if (REMOTE.test(path)) return undefined;

  if (path.startsWith("/")) {
    const inDocs = join(root, "docs", path);
    if (conversions.has(inDocs)) return inDocs;
    const inPublic = join(root, "docs", "public", path);
    return conversions.has(inPublic) ? inPublic : undefined;
  }

  const target = resolve(dirname(source), path);
  return conversions.has(target) ? target : undefined;
}

async function convertImage(file, { root, quality }) {
  const size = statSync(file).size;

  const extension = extname(file);
  const base = file.slice(0, -extension.length);
  const webp = `${base}.webp`;
  const raw = `${base}.raw${extension}`;

  if (existsSync(raw)) return { file, size, skipped: "已存在 .raw 备份" };
  if (existsSync(webp)) return { file, size, skipped: "已存在同名 .webp" };

  const temporary = `${base}.tmp.webp`;
  const image = sharp(file).rotate();
  const pipeline = /\.png$/i.test(extension)
    ? image.webp({ lossless: true, effort: 5 })
    : image.webp({ quality, effort: 4 });

  try {
    await pipeline.toFile(temporary);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }

  const webpSize = statSync(temporary).size;
  if (webpSize >= size) {
    rmSync(temporary, { force: true });
    return { file, size, skipped: `WebP 未变小 (${formatSize(webpSize)})` };
  }

  renameSync(file, raw);
  renameSync(temporary, webp);

  console.log(
    `  ✓ ${show(file, root)}  ${formatSize(size)} → ${formatSize(webpSize)}  (${Math.round((1 - webpSize / size) * 100)}% ↓)`,
  );

  return { file, webp, size, webpSize };
}

function updateReferences(conversions, { root, referenceDirectories, skipped }) {
  if (!conversions.size) return 0;

  const textFiles = referenceDirectories
    .flatMap(listFiles)
    .filter((file) => TEXT_FILE.test(file) && !isSkipped(file, skipped));

  let updated = 0;
  for (const file of textFiles) {
    const source = readFileSync(file, "utf8");
    const next = source.replace(URL_PATTERN, (token) => {
      if (RAW_BACKUP.test(token)) return token;
      const target = resolveReference(token, file, conversions, root);
      return target ? token.replace(/\.(?:png|jpe?g)$/i, ".webp") : token;
    });

    if (next === source) continue;
    writeFileSync(file, next, "utf8");
    updated += 1;
  }
  return updated;
}

/**
 * 把内容目录里超过阈值的图片转为 WebP，并把原图重命名为 `.raw.<ext>` 备份。
 * 返回本次转换结果，便于脚本或 pub 复用。
 */
export async function optimizeImages({
  root = projectRoot,
  threshold = DEFAULT_THRESHOLD,
  quality = DEFAULT_QUALITY,
  dryRun = false,
  directories = [join(root, "docs"), join(root, "data")],
  referenceDirectories = [join(root, "docs"), join(root, "data"), join(root, ".vitepress")],
  // public 会被原样复制到产物，保留 .raw 备份会一起发布，因此默认跳过。
  skipped = [join(root, "docs", "public"), join(root, ".vitepress", "cache"), join(root, ".vitepress", "dist")],
} = {}) {
  const images = directories
    .flatMap(listFiles)
    .filter((file) => CONVERTIBLE.test(file) && !RAW_BACKUP.test(file) && !isSkipped(file, skipped))
    .map((file) => ({ file, size: statSync(file).size }))
    .filter(({ size }) => size > threshold)
    .sort((a, b) => b.size - a.size);

  if (!images.length) {
    console.log(`没有超过 ${formatSize(threshold)} 的图片需要处理。`);
    return { conversions: [], skipped: [], updatedFiles: 0 };
  }

  console.log(`图片优化：阈值 ${formatSize(threshold)}，候选 ${images.length} 张${dryRun ? "（dry run）" : ""}`);

  const conversions = new Map();
  const skippedImages = [];

  for (const { file } of images) {
    if (dryRun) {
      console.log(`  · ${show(file, root)}  ${formatSize(statSync(file).size)} → 将转为 WebP`);
      continue;
    }

    const result = await convertImage(file, { root, quality });
    if (!result) continue;
    if (result.skipped) {
      skippedImages.push(result);
      console.log(`  - ${show(result.file, root)}  跳过：${result.skipped}`);
      continue;
    }
    conversions.set(result.file, result);
  }

  if (dryRun) return { conversions: [], skipped: skippedImages, updatedFiles: 0 };

  const updatedFiles = updateReferences(conversions, { root, referenceDirectories, skipped });
  const saved = [...conversions.values()].reduce((total, item) => total + item.size - item.webpSize, 0);

  console.log(
    `完成：转换 ${conversions.size} 张，节省 ${formatSize(saved)}，更新 ${updatedFiles} 个引用文件；跳过 ${skippedImages.length} 张。`,
  );

  return { conversions: [...conversions.values()], skipped: skippedImages, updatedFiles };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    return;
  }

  const unknown = args.filter((argument, index) => {
    if (["--dry-run", "--help", "-h"].includes(argument)) return false;
    if (["--threshold", "--quality"].includes(argument)) return false;
    if (argument.startsWith("--threshold=") || argument.startsWith("--quality=")) return false;
    if (index > 0 && ["--threshold", "--quality"].includes(args[index - 1])) return false;
    return true;
  });
  if (unknown.length) fail(`未知参数：${unknown.join(" ")}\n\n${USAGE}`);

  await optimizeImages({
    threshold: parseThreshold(readOption(args, "--threshold") ?? String(DEFAULT_THRESHOLD)),
    quality: parseQuality(readOption(args, "--quality") ?? String(DEFAULT_QUALITY)),
    dryRun: args.includes("--dry-run"),
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runMain(main);
}
