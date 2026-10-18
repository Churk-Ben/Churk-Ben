import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_OUT = join(root, "import/notes");
const COOKIE_FILE = join(root, "private/mi-cookie.txt");
const PAGE_LIMIT = 200;
const MAX_PAGES = 100;
const DETAIL_DELAY = 120;

const USAGE = `用法：
  pnpm mi:notes [选项]

从小米云便签（i.mi.com）导出笔记为 Markdown。默认先列出全部便签，
再交互式选择要导出的条目。

选项：
  --out <目录>       输出目录，默认 import/notes
                     也可以写 private/posts，直接对接隐私文章流程
  --limit <数量>     只考虑最近创建的 N 条
  --search <关键词>  按标题或摘要筛选
  --folder <名称>    只导出指定分类（文件夹）的便签
  --folders          列出所有分类及便签数量，不导出
  --all              不询问，导出全部（可以配合 --limit / --search / --folder）
  --no-images        不下载图片，正文中的图片会被省略
  --force            覆盖已存在的同名目录
  --help             显示这段帮助

准备 Cookie：
  1. 浏览器登录 https://i.mi.com/note
  2. 按 F12 → 网络（Network）→ 刷新页面
  3. 找到任意一个 note/ 开头的请求，复制请求头里的 Cookie 整行
  4. 保存到 private/mi-cookie.txt（该目录已被 git 忽略）
     或设置环境变量 MI_COOKIE

  海外账号可以设置 MI_NOTES_BASE=https://us.i.mi.com

限制：私密笔记、待办和思维导图支持有限；图片以外的附件会被跳过。`;

const LIST_TYPES = new Set(["checkbox", "bullet", "order"]);
const HEADING_TAGS = [
  { tag: "size", prefix: "#" },
  { tag: "mid-size", prefix: "##" },
  { tag: "h3-size", prefix: "###" },
];
const IMAGE_EXTENSIONS = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

function fail(message) {
  throw new Error(message);
}

function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms));
}

function isInteractive() {
  return Boolean(stdin.isTTY && stdout.isTTY);
}

function show(file) {
  const path = relative(root, file);
  return (path && !path.startsWith("..") ? path : file).replaceAll("\\", "/");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function truncate(text, max) {
  const characters = [...text];
  return characters.length > max ? `${characters.slice(0, max - 1).join("")}…` : text;
}

function displayWidth(text) {
  let width = 0;
  for (const character of text) {
    width += /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/.test(
      character,
    )
      ? 2
      : 1;
  }
  return width;
}

function padDisplay(text, width) {
  return `${text}${" ".repeat(Math.max(0, width - displayWidth(text)))}`;
}

function formatDate(value, withTime = false) {
  const date = new Date(Number(value) || Date.now());
  const pad = (number) => String(number).padStart(2, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return withTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
}

function decodeEntities(text) {
  const named = { amp: "&", apos: "'", nbsp: " ", quot: '"' };
  return text.replace(/&(#x?[\da-f]+|amp|apos|nbsp|quot);/gi, (match, code) => {
    const key = code.toLowerCase();
    if (key.startsWith("#x")) return numericEntity(match, Number.parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return numericEntity(match, Number.parseInt(key.slice(1), 10));
    return named[key] ?? match;
  });
}

/** 尖括号保持实体形式，避免正文里的 &lt;script&gt; 变成真的 HTML 标签。 */
function numericEntity(match, codePoint) {
  if (!Number.isInteger(codePoint) || codePoint === 60 || codePoint === 62) return match;
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return match;
  }
}

function convertInline(input) {
  let text = String(input);

  text = text.replace(/<br\s*\/?>/gi, "  \n");
  text = text.replace(/<(?:sound|video|file)\b[^>]*\/?>/gi, "");
  text = text.replace(/<b>([\s\S]*?)<\/b>/gi, "**$1**");
  text = text.replace(/<i>([\s\S]*?)<\/i>/gi, "*$1*");
  text = text.replace(/<delete>([\s\S]*?)<\/delete>/gi, "~~$1~~");
  text = text.replace(/<u>([\s\S]*?)<\/u>/gi, "<u>$1</u>");
  text = text.replace(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  text = text.replace(
    /<align\s+[^>]*align="(center|left|right)"[^>]*>([\s\S]*?)<\/align>/gi,
    '<div align="$1">$2</div>',
  );
  text = text.replace(/<background\s+color="([^"]+)">([\s\S]*?)<\/background>/gi, (_, color, inner) => {
    return `<mark style="background:${bgrToRgb(color)}">${inner}</mark>`;
  });
  for (const { tag } of HEADING_TAGS) {
    text = text.replace(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "gi"), "**$1**");
  }

  return decodeEntities(text);
}

function bgrToRgb(color) {
  const hex = color.replace("#", "");
  if (hex.length < 6) return color;
  return `#${hex.slice(4, 6)}${hex.slice(2, 4)}${hex.slice(0, 2)}`;
}

function headingOf(content) {
  for (const { tag, prefix } of HEADING_TAGS) {
    const match = content.match(new RegExp(`^<${tag}>([\\s\\S]*?)</${tag}>$`, "i"));
    if (match) return `${prefix} ${convertInline(match[1]).trim()}`;
  }
  return null;
}

function indentLevel(value) {
  return Math.max(0, Number(value || 0) - 1);
}

function parseLine(line) {
  if (!line) return { type: "blank", text: "" };

  if (/^<hr\s*\/?>$/i.test(line)) return { type: "hr", text: "---" };

  const checkbox = line.match(/^<input\b([^>]*?)\/?>(.*)$/i);
  if (checkbox && /type="checkbox"/i.test(checkbox[1])) {
    const indent = indentLevel(/indent="(\d+)"/i.exec(checkbox[1])?.[1]);
    const checked = /checked="true"/i.test(checkbox[1]);
    return {
      type: "checkbox",
      text: `${"  ".repeat(indent)}- [${checked ? "x" : " "}] ${convertInline(checkbox[2].trim())}`,
    };
  }

  const order = line.match(/^<order\b([^>]*)>([\s\S]*?)<\/order>$/i);
  if (order) {
    const indent = indentLevel(/indent="(\d+)"/i.exec(order[1])?.[1]);
    return { type: "order", text: `${"  ".repeat(indent)}1. ${convertInline(order[2].trim())}` };
  }

  const bullet = line.match(/^<bullet\b([^>]*)>([\s\S]*?)<\/bullet>$/i);
  if (bullet) {
    const indent = indentLevel(/indent="(\d+)"/i.exec(bullet[1])?.[1]);
    return { type: "bullet", text: `${"  ".repeat(indent)}- ${convertInline(bullet[2].trim())}` };
  }

  const quote = line.match(/^<quote\b[^>]*>([\s\S]*?)<\/quote>$/i);
  if (quote) return { type: "quote", text: `> ${convertInline(quote[1].trim())}` };

  const text = line.match(/^<text\b[^>]*>([\s\S]*?)<\/text>$/i);
  if (text) {
    if (!text[1].trim()) return { type: "blank", text: "" };
    const heading = headingOf(text[1]);
    if (heading) return { type: "heading", text: heading };
    return { type: "text", text: convertInline(text[1].trim()) };
  }

  const align = line.match(/^<align\b[^>]*align="(center|left|right)"[^>]*>([\s\S]*?)<\/align>$/i);
  if (align) {
    return { type: "text", text: `<div align="${align[1]}">${convertInline(align[2].trim())}</div>` };
  }

  if (line.startsWith("☺")) return null;

  const cleaned = convertInline(line)
    .replace(/<[^>]+>/g, "")
    .trim();
  return cleaned ? { type: "text", text: cleaned } : null;
}

function needsBlankLine(previous, current) {
  if (!previous || previous === "blank" || current === "blank") return false;
  if (previous === current && LIST_TYPES.has(current)) return false;
  if (previous === current && current === "quote") return false;
  if (previous === "text" && current === "text") return true;
  if (["heading", "hr", "quote"].includes(previous) || ["heading", "hr", "quote"].includes(current)) return true;
  return LIST_TYPES.has(previous) !== LIST_TYPES.has(current);
}

/**
 * 把小米便签的类 HTML 内容转成 Markdown。
 * 转换规则参考 mi-note-export（MIT）: https://github.com/ceynri/mi-note-export
 */
export function noteToMarkdown(raw) {
  const lines = String(raw)
    .replace(/<new-format\s*\/>/gi, "")
    .split(/\r?\n/);
  const output = [];
  let previous = "";

  for (const line of lines) {
    const parsed = parseLine(line.trim());
    if (!parsed) continue;
    if (output.length && needsBlankLine(previous, parsed.type)) output.push("");
    output.push(parsed.text);
    previous = parsed.type;
  }

  return output
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function loadCookie() {
  const fromEnv = process.env.MI_COOKIE?.trim();
  if (fromEnv) return normalizeCookie(fromEnv);

  if (existsSync(COOKIE_FILE)) {
    const saved = readFileSync(COOKIE_FILE, "utf8").trim();
    if (saved) return normalizeCookie(saved);
  }

  fail(
    `缺少小米 Cookie。请把浏览器里的 Cookie 保存到 ${show(COOKIE_FILE)}，或设置环境变量 MI_COOKIE。\n` +
      "获取方法：登录 https://i.mi.com/note，按 F12 打开开发者工具，在“网络”里刷新页面，" +
      "复制任意 note/ 请求的 Cookie 请求头。",
  );
}

function normalizeCookie(value) {
  return value
    .replace(/^cookie:\s*/i, "")
    .replace(/\r?\n/g, "; ")
    .trim();
}

function apiBase() {
  return (process.env.MI_NOTES_BASE || "https://i.mi.com").replace(/\/+$/, "");
}

function apiHeaders(cookie) {
  const base = apiBase();
  return {
    Cookie: cookie,
    Referer: `${base}/note/h5`,
    Origin: base,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  };
}

async function apiGet(cookie, pathname) {
  const response = await fetch(`${apiBase()}${pathname}`, { headers: apiHeaders(cookie) });
  const body = await response.text();
  let json;

  try {
    json = JSON.parse(body);
  } catch {
    fail(`小米云返回了非 JSON 内容（HTTP ${response.status}），请稍后重试。`);
  }
  if (!json || typeof json !== "object") {
    fail(`小米云返回了无法识别的响应（HTTP ${response.status}）。`);
  }

  if (response.status === 401 || response.status === 403 || json.R === 401) {
    fail("Cookie 无效或已过期。请重新登录 i.mi.com，复制新的 Cookie 更新 private/mi-cookie.txt。");
  }
  if (!response.ok) fail(`请求小米云失败（HTTP ${response.status}）。`);
  if (json.result !== "ok" || !json.data) {
    fail(`接口返回异常：${json.description || json.code || "未知错误"}`);
  }

  return json.data;
}

async function fetchNotes(cookie) {
  const entries = [];
  const folders = new Map();
  let syncTag = "";

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const params = new URLSearchParams({ ts: String(Date.now()), limit: String(PAGE_LIMIT) });
    if (syncTag) params.set("syncTag", syncTag);

    const data = await apiGet(cookie, `/note/full/page/?${params}`);
    entries.push(...(data.entries ?? []));
    collectFolders(data.folders, folders);
    stdout.write(`\r\x1b[2K📋 已读取 ${entries.length} 条便签...`);

    const nextTag = data.syncTag ? String(data.syncTag) : "";
    if (data.lastPage || !nextTag || nextTag === syncTag) break;
    syncTag = nextTag;
    await sleep(300);
  }

  stdout.write("\r\x1b[2K");
  return { entries, folders };
}

function collectFolders(folders, target) {
  if (Array.isArray(folders)) {
    for (const folder of folders) target.set(String(folder.id), folder.subject ?? "");
  } else if (folders && typeof folders === "object") {
    for (const [id, folder] of Object.entries(folders)) {
      target.set(String(folder.id ?? id), folder.subject ?? "");
    }
  }
}

async function fetchDetail(cookie, id) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const data = await apiGet(cookie, `/note/note/${encodeURIComponent(id)}/?ts=${Date.now()}`);
      if (data.entry) return data.entry;
      throw new Error("响应里没有笔记内容");
    } catch (error) {
      lastError = error;
      if (String(error.message).includes("Cookie")) throw error;
      if (attempt < 3) await sleep(500 * attempt);
    }
  }

  throw lastError;
}

function parseExtraInfo(entry) {
  const raw = entry?.extraInfo;
  if (!raw) return {};
  if (typeof raw === "object") return raw;

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function plainText(value) {
  return decodeEntities(String(value).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function folderName(folders, folderId) {
  const id = String(folderId ?? "");
  if (!id || id === "0") return "未分类";
  return folders.get(id) ?? "未分类";
}

function noteTitle(entry, fallback) {
  const extra = parseExtraInfo(entry);
  const candidates = [extra.title, entry?.subject, plainText(entry?.snippet ?? ""), fallback];

  for (const candidate of candidates) {
    const title = plainText(candidate ?? "");
    if (title) return title;
  }

  return `便签 ${formatDate(entry?.createDate)}`;
}

function slugify(title, id, date) {
  const words = String(title)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 6)
    .join("-");
  const suffix = String(id)
    .replace(/[^a-z0-9]/gi, "")
    .slice(-8)
    .toLowerCase();

  return `${date}-${words || suffix || "note"}`;
}

function noteFiles(entry) {
  const files = entry?.setting?.data ?? entry?.files ?? [];
  if (!Array.isArray(files)) return [];

  return files
    .map((file) => {
      const rawId = String(file.rawId || file.fileId || "");
      const dot = rawId.indexOf(".");
      return {
        rawId,
        fileId: dot >= 0 ? rawId.slice(dot + 1) : rawId,
        mime: String(file.mimeType || ""),
      };
    })
    .filter((file) => file.rawId && file.mime.startsWith("image/"));
}

function imageExtension(mime) {
  return IMAGE_EXTENSIONS[mime.split(";")[0].trim().toLowerCase()] ?? "jpg";
}

async function downloadImage(cookie, fileId, target) {
  const params = new URLSearchParams({ type: "note_img", fileid: fileId, ts: String(Date.now()) });
  const response = await fetch(`${apiBase()}/file/full?${params}`, {
    headers: apiHeaders(cookie),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const type = response.headers.get("content-type") ?? "";
  if (type && !type.startsWith("image/") && !type.startsWith("application/octet-stream")) {
    throw new Error(`意外的内容类型 ${type}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw new Error("空文件");

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, buffer);
}

async function prepareImages(cookie, entry, noteDirectory, download) {
  const files = noteFiles(entry);
  const markdownPaths = new Map();
  if (!files.length || !download) return { markdownPaths, total: files.length, saved: 0 };

  const directory = join(noteDirectory, "images");
  mkdirSync(directory, { recursive: true });
  let saved = 0;

  for (const [index, file] of files.entries()) {
    const name = `img-${index + 1}.${imageExtension(file.mime)}`;
    const target = join(directory, name);
    const relativePath = `images/${name}`;

    try {
      if (!existsSync(target)) await downloadImage(cookie, file.fileId, target);
      markdownPaths.set(file.rawId, relativePath);
      markdownPaths.set(file.fileId, relativePath);
      saved += 1;
    } catch (error) {
      console.warn(`\n⚠️ 图片下载失败（${file.fileId}）：${error.message}`);
    }
  }

  return { markdownPaths, total: files.length, saved };
}

function replaceAttachments(content, markdownPaths) {
  let output = String(content);

  output = output.replace(/<img\b[^>]*?\/?>/gi, (tag) => {
    for (const [id, path] of markdownPaths) {
      if (tag.includes(id)) return `![图片](${path})`;
    }

    const remote = /src="(https?:\/\/[^"]+)"/i.exec(tag)?.[1];
    return remote ? `![图片](${remote})` : "";
  });

  for (const [id, path] of markdownPaths) {
    output = output.replace(new RegExp(`☺\\s*${escapeRegExp(id)}(?:<[^>]*></>)?`, "g"), `![图片](${path})`);
  }

  return output.replace(/☺\s*[^\s<]+(?:<[^>]*><\/>)?/g, "");
}

function dropDuplicateTitle(body, title) {
  const lines = body.split("\n");
  const first = lines[0]?.trim() ?? "";
  if (first === title || first === `# ${title}`) {
    const rest = lines.slice(1);
    while (rest.length && !rest[0].trim()) rest.shift();
    return rest.join("\n");
  }
  return body;
}

function buildMarkdown({ title, date, id, notebook, body }) {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${date}`,
    "tags: []",
    `miNoteId: ${JSON.stringify(String(id))}`,
  ];
  if (notebook) frontmatter.push(`miNotebook: ${JSON.stringify(notebook)}`);
  frontmatter.push("---");

  const head = `${frontmatter.join("\n")}\n\n# ${title}\n`;
  return body ? `${head}\n${body}\n` : head;
}

async function exportNote(cookie, entry, options, folders, usedSlugs) {
  const detail = await fetchDetail(cookie, entry.id);
  const extra = parseExtraInfo(detail);
  const title = noteTitle(detail, noteTitle(entry));
  const created = Number(detail.createDate ?? entry.createDate ?? Date.now());
  const date = formatDate(created);
  const baseSlug = slugify(title, detail.id ?? entry.id, date);

  let slug = baseSlug;
  for (let count = 2; usedSlugs.has(slug); count += 1) slug = `${baseSlug}-${count}`;

  const directory = join(options.outDir, slug);
  if (existsSync(directory) && !options.force) {
    usedSlugs.add(slug);
    return { skipped: true, directory };
  }

  const content = String(extra.mind_content || detail.content || detail.snippet || "");
  const images = await prepareImages(cookie, detail, directory, options.images);
  const body = dropDuplicateTitle(noteToMarkdown(replaceAttachments(content, images.markdownPaths)), title);
  const notebook = folders.get(String(detail.folderId ?? entry.folderId ?? "")) || "";

  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, "index.md"),
    buildMarkdown({ title, date, id: detail.id ?? entry.id, notebook, body }),
    "utf8",
  );
  usedSlugs.add(slug);

  return { slug, directory, images: images.saved, imageTotal: images.total };
}

function parseSelection(value, total) {
  if (/^(?:all|\*)$/i.test(value)) return Array.from({ length: total }, (_, index) => index);

  const picked = new Set();
  for (const part of value.split(/[,，\s]+/).filter(Boolean)) {
    const range = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!range) throw new Error(`无法识别“${part}”，请输入序号或范围，例如 1,3-5`);

    const start = Number(range[1]);
    const end = Number(range[2] ?? range[1]);
    if (start < 1 || end > total || start > end) throw new Error(`序号超出范围：${part}`);

    for (let number = start; number <= end; number += 1) picked.add(number - 1);
  }

  return [...picked].sort((a, b) => a - b);
}

function printNotes(notes, folders) {
  console.log(`\n找到 ${notes.length} 条便签（按创建时间倒序，方括号内为分类）：`);
  const width = String(notes.length).length;

  for (const [index, entry] of notes.entries()) {
    const title = noteTitle(entry);
    const snippet = plainText(entry.snippet ?? "");
    const folder = folderName(folders, entry.folderId);
    console.log(
      `  ${String(index + 1).padStart(width)}. ${formatDate(entry.createDate, true)}  ${padDisplay(
        `[${truncate(folder, 10)}]`,
        12,
      )} ${padDisplay(truncate(title, 30), 30)} ${truncate(snippet, 40)}`,
    );
  }
  console.log("");
}

function folderCounts(entries, folders) {
  const counts = new Map();

  for (const entry of entries) {
    if (entry.id == null || (entry.status && entry.status !== "normal")) continue;
    const name = folderName(folders, entry.folderId);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return counts;
}

function printFolders(entries, folders) {
  const counts = folderCounts(entries, folders);
  if (!counts.size) {
    console.log("便签列表为空。");
    return;
  }

  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh"));
  const width = Math.max(...rows.map(([name]) => displayWidth(name)), 4);
  const total = rows.reduce((sum, [, count]) => sum + count, 0);

  console.log(`\n分类（${rows.length} 个，共 ${total} 条便签）：`);
  for (const [name, count] of rows) {
    console.log(`  ${padDisplay(name, width)}  ${String(count).padStart(4)} 条`);
  }
  console.log("\n用 --folder <名称> 只看某个分类，例如：pnpm mi:notes --folder 随笔");
}

async function chooseNotes(notes, folders) {
  printNotes(notes, folders);

  const rl = createInterface({ input: stdin, output: stdout });
  try {
    while (true) {
      const answer = (await rl.question("选择要导出的便签 [序号/范围，all 全部，q 取消]: ")).trim();
      if (!answer) continue;
      if (/^(?:q|quit)$/i.test(answer)) return [];

      try {
        const picked = parseSelection(answer, notes.length);
        if (picked.length) return picked;
        console.log("请至少选择一条便签。");
      } catch (error) {
        console.log(error.message);
      }
    }
  } finally {
    rl.close();
  }
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) fail(`${flag} 需要一个值。`);
  return value;
}

function parseArgs(argv) {
  const options = {
    outDir: DEFAULT_OUT,
    limit: null,
    search: "",
    folder: "",
    folders: false,
    all: false,
    images: true,
    force: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    switch (argument) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--all":
        options.all = true;
        break;
      case "--no-images":
        options.images = false;
        break;
      case "--force":
        options.force = true;
        break;
      case "--out":
        options.outDir = resolve(root, requireValue(argv, index + 1, "--out"));
        index += 1;
        break;
      case "--limit": {
        const value = requireValue(argv, index + 1, "--limit");
        const limit = Number(value);
        if (!Number.isInteger(limit) || limit < 1) fail("--limit 需要一个正整数。");
        options.limit = limit;
        index += 1;
        break;
      }
      case "--search":
        options.search = requireValue(argv, index + 1, "--search").trim();
        index += 1;
        break;
      case "--folder":
        options.folder = requireValue(argv, index + 1, "--folder").trim();
        index += 1;
        break;
      case "--folders":
        options.folders = true;
        break;
      default:
        fail(`未知参数：${argument}。运行 pnpm mi:notes --help 查看用法。`);
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(USAGE);
    return;
  }

  const cookie = loadCookie();
  console.log("🔐 正在校验 Cookie...");
  await apiGet(cookie, `/note/full/page/?ts=${Date.now()}&limit=1`);
  console.log("✅ Cookie 有效");

  const { entries, folders } = await fetchNotes(cookie);

  if (options.folders) {
    printFolders(entries, folders);
    return;
  }

  let notes = entries.filter((entry) => entry.id != null && (!entry.status || entry.status === "normal"));

  if (options.folder) {
    const keyword = options.folder.toLowerCase();
    notes = notes.filter((entry) => folderName(folders, entry.folderId).toLowerCase().includes(keyword));
  }
  if (options.search) {
    const keyword = options.search.toLowerCase();
    notes = notes.filter((entry) =>
      `${noteTitle(entry)} ${plainText(entry.snippet ?? "")}`.toLowerCase().includes(keyword),
    );
  }
  notes.sort((a, b) => Number(b.createDate ?? 0) - Number(a.createDate ?? 0));
  if (options.limit) notes = notes.slice(0, options.limit);

  if (!notes.length) {
    if (options.folder) {
      const names = [...folderCounts(entries, folders).keys()].join("、");
      console.log(`没有找到分类「${options.folder}」下的便签。现有分类：${names}`);
    } else {
      console.log("没有匹配的便签。");
    }
    return;
  }

  let picked;
  if (options.all) {
    picked = notes.map((_, index) => index);
  } else if (!isInteractive()) {
    fail("当前终端不可交互。请加 --all 导出全部，或用 --limit / --search / --folder 配合 --all 筛选。");
  } else {
    picked = await chooseNotes(notes, folders);
  }

  if (!picked.length) {
    console.log("已取消。");
    return;
  }

  const usedSlugs = new Set();
  let exported = 0;
  let skipped = 0;
  let failed = 0;
  let images = 0;

  for (const [position, index] of picked.entries()) {
    const entry = notes[index];
    const label = truncate(noteTitle(entry), 30);

    try {
      const result = await exportNote(cookie, entry, options, folders, usedSlugs);
      if (result.skipped) {
        skipped += 1;
        console.log(`[${position + 1}/${picked.length}] ⏭️  已存在：${show(result.directory)}`);
      } else {
        exported += 1;
        images += result.images;
        console.log(`[${position + 1}/${picked.length}] ✅ ${label} -> ${show(result.directory)}`);
      }
    } catch (error) {
      failed += 1;
      console.error(`[${position + 1}/${picked.length}] ❌ ${label}：${error.message}`);
    }

    if (position < picked.length - 1) await sleep(DETAIL_DELAY);
  }

  console.log("");
  console.log(
    `完成：导出 ${exported} 篇，跳过 ${skipped} 篇，失败 ${failed} 篇${images ? `，下载图片 ${images} 张` : ""}。`,
  );
  if (exported) {
    console.log(`输出目录：${show(options.outDir)}`);
    console.log("发布到博客：把需要的目录复制到 private/posts/，再运行 pnpm private 加密。");
  }
}

const runningDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (runningDirectly) {
  main().catch((error) => {
    console.error(`\x1b[31m${error.message}\x1b[0m`);
    process.exitCode = 1;
  });
}
