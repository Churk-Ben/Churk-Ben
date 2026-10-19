import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { katex } from "@mdit/plugin-katex";
import matter from "gray-matter";
import sharp from "sharp";
import { createMarkdownRenderer } from "vitepress";
import {
  MARKER,
  SLUG_PATTERN,
  cleanupStale,
  createKey,
  docsDir,
  encrypt,
  loadEnv,
  payloadDir,
  privateDir,
  readConfig,
  readEntries,
  readPayload,
  readPost,
  sourceDir,
  writeManifest,
} from "./utils-private.mjs";

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

export async function build() {
  loadEnv();

  const entries = readEntries();

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
  const key = await createKey(password, config);
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
    const plaintext = JSON.stringify({ title: meta.title, html: body });

    // 明文没变时复用旧密文，避免随机 IV 导致每次运行都换文件名。
    const payloadFiles = readdirSync(payloadDir)
      .filter((name) => name.startsWith(`${slug}.`) && name.endsWith(".json"))
      .sort();
    let payloadName = "";
    for (const name of payloadFiles) {
      if ((await readPayload(join(payloadDir, name), key)) === plaintext) {
        payloadName = name;
        break;
      }
    }

    if (payloadName) {
      console.log(`Unchanged ${slug} -> docs/public/private/${payloadName}`);
    } else {
      const payload = await encrypt(plaintext, key, config);
      const serialized = JSON.stringify(payload);
      const hash = createHash("sha256").update(serialized).digest("hex").slice(0, 8);
      payloadName = `${slug}.${hash}.json`;
      writeFileSync(join(payloadDir, payloadName), serialized, "utf8");
      console.log(`Encrypted ${slug} -> docs/public/private/${payloadName}`);
    }

    // 只清理这篇稿件旧的密文，避免误删其他隐私文章。
    for (const name of payloadFiles) {
      if (name !== payloadName) rmSync(join(payloadDir, name));
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

    const placeholder = `\n<!-- ${MARKER}，请勿手动编辑。 -->\n\n<MPrivatePost src="/private/${payloadName}" />\n`;
    const page = matter.stringify(placeholder, frontmatter);
    if (!existsSync(targetFile) || readFileSync(targetFile, "utf8") !== page) {
      mkdirSync(targetDir, { recursive: true });
      writeFileSync(targetFile, page, "utf8");
    }

    manifest.push({
      url: `/private/${slug}`,
      title: meta.title,
      date: meta.date,
      tags: meta.tags,
      ...(banner ? { banner } : {}),
    });
  }

  cleanupStale(new Set(entries.map((entry) => entry.name)));
  await writeManifest(manifest, key, config);

  console.log("");
  console.log("完成。请提交 docs/private/ 与 docs/public/private/ 下的生成文件；private/ 已被忽略。");
}
