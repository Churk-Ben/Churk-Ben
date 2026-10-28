import { existsSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import type { Plugin } from "vite";
import sharp from "sharp";

const IMAGE_PATTERN = /\.(?:avif|webp|png|jpe?g|gif|svg)$/i;
const RAW_PATTERN = /\.raw\.[^./]+$/i;
const REMOTE_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;
const WIDTH = 32;
const QUALITY = 40;

let projectRoot = process.cwd();
const placeholders = new Map<string, string>();
let pending: Promise<void> | undefined;
let generated = false;

function filesIn(directory: string): string[] {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}

function keyOf(file: string) {
  return relative(projectRoot, resolve(file)).replaceAll("\\", "/");
}

function decode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** 把 Markdown / frontmatter 里的图片地址解析成实际文件，方便查占位图。 */
function resolveSource(source: string, baseFile?: string) {
  const path = decode(source.split(/[?#]/, 1)[0]);
  if (!path || REMOTE_PATTERN.test(path)) return undefined;

  return path.startsWith("/")
    ? join(projectRoot, "docs", "public", path.slice(1))
    : baseFile
      ? resolve(dirname(baseFile), path)
      : undefined;
}

async function generate() {
  placeholders.clear();

  const files = [join(projectRoot, "docs", "posts"), join(projectRoot, "docs", "public")]
    .flatMap((directory) => filesIn(directory))
    .filter((file) => IMAGE_PATTERN.test(file) && !RAW_PATTERN.test(file));

  for (const file of files) {
    try {
      const buffer = await sharp(file)
        .rotate()
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 4 })
        .toBuffer();
      placeholders.set(keyOf(file), `data:image/webp;base64,${buffer.toString("base64")}`);
    } catch {
      // 无法解码的图片不生成占位图，原文仍会正常渲染。
    }
  }
}

/** 生成所有文档图片的模糊占位图；同一进程只执行一次。 */
export function ensurePlaceholders() {
  if (generated) return Promise.resolve();

  pending ??= generate()
    .then(() => {
      generated = true;
    })
    .catch((error) => {
      pending = undefined;
      throw error;
    });

  return pending;
}

/** 按源文件路径查占位图。 */
export function getPlaceholderForFile(file: string) {
  return placeholders.get(keyOf(file));
}

/** 按图片地址和当前 Markdown 文件位置查占位图。 */
export function getPlaceholderForSource(source: string, baseFile?: string) {
  const file = resolveSource(source, baseFile);
  return file ? getPlaceholderForFile(file) : undefined;
}

/**
 * Vite 插件：为 `?lqip` 请求返回内联的模糊占位图。
 *
 * Markdown 图片使用 Node 侧生成的占位图直接写进 HTML；头图等客户端图片则
 * 通过 `import.meta.glob(..., { query: "?lqip" })` 复用这里的结果。
 */
export function imagePlaceholderPlugin(): Plugin {
  return {
    name: "image-placeholder",
    enforce: "pre",
    configResolved(config) {
      projectRoot = existsSync(join(config.root, "docs")) ? config.root : dirname(config.root);
    },
    async buildStart() {
      await ensurePlaceholders();
    },
    async load(id) {
      const [file, query = ""] = id.split("?");
      if (!query.startsWith("lqip")) return;

      await ensurePlaceholders();
      const data = placeholders.get(keyOf(file)) ?? "";
      return `export default ${JSON.stringify(data)};`;
    },
  };
}
