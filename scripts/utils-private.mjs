import { webcrypto } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { root } from "./utils-cli.mjs";

export { root };
export const sourceDir = join(root, "private/posts");
export const docsDir = join(root, "docs");
export const privateDir = join(docsDir, "private");
export const payloadDir = join(docsDir, "public/private");
export const configFile = join(root, ".vitepress/content/private.json");
export const MARKER = "由 scripts/private.mjs 生成";
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 读取本地 env 文件；不覆盖已存在的环境变量。 */
export function loadEnv() {
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

export function readConfig() {
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

/** 只派生一次密钥，加密与解密共用，避免每篇文章重复跑 PBKDF2。 */
export async function createKey(password, config) {
  const salt = Buffer.from(config.salt, "base64");
  const material = await webcrypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  return webcrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: config.iterations,
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encrypt(text, key, config) {
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

async function decrypt(payload, key) {
  const decrypted = await webcrypto.subtle.decrypt(
    { name: "AES-GCM", iv: Buffer.from(payload.iv, "base64") },
    key,
    Buffer.from(payload.data, "base64"),
  );
  return new TextDecoder().decode(decrypted);
}

/** 读取已有密文并解密；密码变更或文件损坏时返回 null，让调用方重新加密。 */
export async function readPayload(file, key) {
  try {
    return await decrypt(JSON.parse(readFileSync(file, "utf8")), key);
  } catch {
    return null;
  }
}

export function readPost(data, sourceFile) {
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

/** 读取 private/posts 下所有包含 index.md 的文章目录。 */
export function readEntries() {
  return existsSync(sourceDir)
    ? readdirSync(sourceDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(sourceDir, entry.name, "index.md")))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];
}

/** 删除已经从 private/posts 移除的文章生成物，只清理带生成标记的页面。 */
export function cleanupStale(activeSlugs) {
  if (existsSync(privateDir)) {
    for (const entry of readdirSync(privateDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || activeSlugs.has(entry.name)) continue;

      const targetFile = join(privateDir, entry.name, "index.md");
      if (!existsSync(targetFile) || !readFileSync(targetFile, "utf8").includes(MARKER)) {
        console.warn(`跳过无法确认来源的目录：docs/private/${entry.name}`);
        continue;
      }

      rmSync(join(privateDir, entry.name), { recursive: true });
      console.log(`Removed stale page docs/private/${entry.name}`);
    }
  }

  if (!existsSync(payloadDir)) return;

  for (const name of readdirSync(payloadDir)) {
    if (name === "manifest.json") continue;
    const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.[0-9a-f]{8}\.json$/.exec(name);
    if (!match || activeSlugs.has(match[1])) continue;

    rmSync(join(payloadDir, name));
    console.log(`Removed stale payload docs/public/private/${name}`);
  }
}

export async function writeManifest(manifest, key, config) {
  manifest.sort((a, b) => b.date.localeCompare(a.date) || a.url.localeCompare(b.url));
  const manifestFile = join(payloadDir, "manifest.json");
  const plaintext = JSON.stringify({ posts: manifest });
  const current = existsSync(manifestFile) ? await readPayload(manifestFile, key) : null;
  if (current === plaintext) {
    console.log(`Manifest unchanged (${manifest.length} posts)`);
    return;
  }

  const payload = await encrypt(plaintext, key, config);
  writeFileSync(manifestFile, JSON.stringify(payload), "utf8");
  console.log(`Encrypted manifest (${manifest.length} posts) -> docs/public/private/manifest.json`);
}
