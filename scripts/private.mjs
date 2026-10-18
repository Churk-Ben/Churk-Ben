import { createHash, webcrypto } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { katex } from "@mdit/plugin-katex";
import matter from "gray-matter";
import sharp from "sharp";
import { createMarkdownRenderer } from "vitepress";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceDir = join(root, "private/posts");
const docsDir = join(root, "docs");
const privateDir = join(docsDir, "private");
const payloadDir = join(docsDir, "public/private");
const configFile = join(root, ".vitepress/content/private.json");
const MARKER = "由 scripts/private.mjs 生成";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BANNER_NAMES = ["banner", "cover"];
const BANNER_EXTENSIONS = ["avif", "webp", "png", "jpg", "jpeg", "gif", "svg"];
const IMAGE_MIME = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

/** 读取本地 env 文件；不覆盖已存在的环境变量。 */
function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = join(root, name);
    if (!existsSync(file)) continue;

    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[match[1]] === undefined) process.env[match[1]] = value;
    }
  }
}

function readConfig() {
  const config = JSON.parse(readFileSync(configFile, "utf8"));
  if (!Number.isInteger(config.iterations) || config.iterations < 100_000) {
    throw new Error(`${configFile}: iterations must be an integer >= 100000`);
  }
  if (typeof config.salt !== "string" || Buffer.from(config.salt, "base64").length < 16) {
    throw new Error(`${configFile}: salt must be at least 16 bytes of base64`);
  }
  return config;
}

function normalizeDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("frontmatter.date is invalid");
  return date.toISOString().slice(0, 10);
}

async function imageDataUrl(file) {
  const extension = extname(file).toLowerCase();
  const buffer = readFileSync(file);

  // SVG 与 GIF 保持原格式，避免破坏矢量/动画。
  if (extension === ".svg" || extension === ".gif") {
    return `data:${IMAGE_MIME[extension]};base64,${buffer.toString("base64")}`;
  }

  try {
    let image = sharp(buffer);
    const metadata = await image.metadata();
    if (metadata.width && metadata.width > 1600) {
      image = image.resize({ width: 1600, withoutEnlargement: true });
    }
    const webp = await image.webp({ quality: 82 }).toBuffer();
    return `data:image/webp;base64,${webp.toString("base64")}`;
  } catch {
    const mime = IMAGE_MIME[extension];
    if (!mime) throw new Error(`unsupported image type: ${file}`);
    return `data:${mime};base64,${buffer.toString("base64")}`;
  }
}

async function resolveBanner(data, sourceFile) {
  if (data.banner === false) return "";
  if (typeof data.banner === "string" && data.banner.trim()) {
    const value = data.banner.trim();
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/)/i.test(value)) return value;

    const file = join(dirname(sourceFile), decodeURIComponent(value.split(/[?#]/)[0]));
    if (!existsSync(file)) throw new Error(`missing private banner: ${value}`);
    return imageDataUrl(file);
  }

  const directory = dirname(sourceFile);
  for (const name of BANNER_NAMES) {
    for (const folder of ["", "images"]) {
      for (const extension of BANNER_EXTENSIONS) {
        const file = join(directory, folder, `${name}.${extension}`);
        if (existsSync(file)) return imageDataUrl(file);
      }
    }
  }

  return "";
}

/** 把正文里的相对图片内联成 data URL，避免私有图片进入公开产物。 */
async function inlineImages(html, sourceFile) {
  const tags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const replacements = new Map();

  for (const tag of tags) {
    const src = /\bsrc=(["'])(.*?)\1/i.exec(tag);
    if (!src) continue;

    const value = src[2];
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i.test(value)) continue;

    const relativePath = decodeURIComponent(value.split(/[?#]/)[0]);
    const file = join(dirname(sourceFile), relativePath);
    if (!existsSync(file)) throw new Error(`missing private image: ${relativePath}`);

    replacements.set(tag, tag.replace(src[0], `src="${await imageDataUrl(file)}"`));
  }

  let output = html;
  for (const [from, to] of replacements) output = output.replace(from, to);
  return output;
}

/** 行内代码里的 {{ }} 不应该被运行时 Vue 编译器当成插值。 */
function protectCode(html) {
  return html.replace(/<code(?![^>]*\bv-pre\b)([^>]*)>/gi, "<code$1 v-pre>");
}

async function renderPost(md, sourceFile) {
  const { content } = matter.read(sourceFile);
  let html = await md.renderAsync(content, { path: sourceFile });
  html = await inlineImages(html, sourceFile);
  return protectCode(html)
    .replaceAll('title="Copy code"', 'title="复制代码"')
    .replaceAll('data-copied="Copied"', 'data-copied="已复制"');
}

async function encrypt(text, password, config) {
  const salt = Buffer.from(config.salt, "base64");
  const material = await webcrypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  const key = await webcrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: config.iterations,
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const encrypted = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text));

  return {
    v: 2,
    kdf: "PBKDF2-SHA256",
    iterations: config.iterations,
    salt: config.salt,
    iv: Buffer.from(iv).toString("base64"),
    data: Buffer.from(encrypted).toString("base64"),
  };
}

function readPost(data, sourceFile) {
  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error(`${sourceFile}: title is required`);
  }
  if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string")) {
    throw new Error(`${sourceFile}: tags must be an array of strings`);
  }

  return {
    title: data.title.trim(),
    date: normalizeDate(data.date),
    tags: [...new Set(data.tags)],
  };
}

async function main() {
  loadEnv();

  const entries = existsSync(sourceDir)
    ? readdirSync(sourceDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(sourceDir, entry.name, "index.md")))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  if (!entries.length) {
    console.log("没有隐私文章；将生成空的加密清单。");
  }

  const password = process.env.PRIVATE_POST_PASSWORD;
  if (!password) {
    throw new Error("缺少 PRIVATE_POST_PASSWORD，请写入 .env.local 或通过环境变量传入");
  }
  if (/^[123]{6}$/.test(password)) {
    console.warn("警告：6 位 1/2/3 密码只有 729 种组合，只能防止随手访问，无法抵御离线暴力破解。");
  } else if (password.length < 12) {
    console.warn("警告：隐私文章密码较短，建议使用更长的密码。");
  }

  const config = readConfig();
  const md = entries.length
    ? await createMarkdownRenderer(docsDir, {
        lineNumbers: true,
        container: {
          tipLabel: "提示",
          warningLabel: "注意",
          dangerLabel: "危险",
          infoLabel: "信息",
          detailsLabel: "详情",
        },
        config(markdown) {
          markdown.use(katex, {
            strict: (code) => (code === "unicodeTextInMathMode" ? "ignore" : "warn"),
          });
        },
      })
    : null;

  mkdirSync(payloadDir, { recursive: true });
  const manifest = [];

  for (const entry of entries) {
    const slug = entry.name;
    if (!SLUG_PATTERN.test(slug)) {
      throw new Error(`隐私文章 slug 必须是小写 kebab-case：private/posts/${slug}`);
    }

    const sourceFile = join(sourceDir, slug, "index.md");
    const { data } = matter.read(sourceFile);
    const meta = readPost(data, sourceFile);
    const banner = await resolveBanner(data, sourceFile);
    const html = await renderPost(md, sourceFile);
    const body = banner ? `<figure class="private-banner"><img src="${banner}" alt=""></figure>\n${html}` : html;
    const payload = await encrypt(JSON.stringify({ title: meta.title, html: body }), password, config);
    const serialized = JSON.stringify(payload);
    const hash = createHash("sha256").update(serialized).digest("hex").slice(0, 8);
    const payloadName = `${slug}.${hash}.json`;

    writeFileSync(join(payloadDir, payloadName), serialized, "utf8");

    // 只清理这篇稿件旧的密文，避免误删其他隐私文章。
    for (const name of readdirSync(payloadDir)) {
      if (name.startsWith(`${slug}.`) && name.endsWith(".json") && name !== payloadName) {
        rmSync(join(payloadDir, name));
      }
    }

    const targetDir = join(privateDir, slug);
    const targetFile = join(targetDir, "index.md");
    if (existsSync(targetFile) && !readFileSync(targetFile, "utf8").includes(MARKER)) {
      throw new Error(`${targetFile}: 已存在同名隐私文章页面，拒绝覆盖`);
    }

    const frontmatter = {
      title: "隐私文章",
      private: true,
      comment: false,
      license: false,
    };

    const placeholder = `<!-- ${MARKER}，请勿手动编辑。 -->\n\n<MPrivatePost src="/private/${payloadName}" />\n`;
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(targetFile, matter.stringify(placeholder, frontmatter), "utf8");

    manifest.push({
      url: `/private/${slug}`,
      title: meta.title,
      date: meta.date,
      tags: meta.tags,
      ...(banner ? { banner } : {}),
    });

    console.log(`Encrypted ${slug} -> docs/public/private/${payloadName}`);
  }

  manifest.sort((a, b) => b.date.localeCompare(a.date) || a.url.localeCompare(b.url));
  const manifestPayload = await encrypt(JSON.stringify({ posts: manifest }), password, config);
  writeFileSync(join(payloadDir, "manifest.json"), JSON.stringify(manifestPayload), "utf8");
  console.log(`Encrypted manifest (${manifest.length} posts) -> docs/public/private/manifest.json`);

  console.log("");
  console.log("完成。请提交 docs/private/ 与 docs/public/private/ 下的生成文件；private/ 已被忽略。");
}

main().catch((error) => {
  console.error(`\x1b[31m${error.message}\x1b[0m`);
  process.exitCode = 1;
});
