import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  cleanupStale,
  createKey,
  loadEnv,
  payloadDir,
  readConfig,
  readEntries,
  readPayload,
  writeManifest,
} from "./utils-private.mjs";

/** 从已加密的清单里移除源中已不存在的文章；没有密码时只提示，不阻塞文件清理。 */
async function pruneManifest(activeSlugs) {
  const manifestFile = join(payloadDir, "manifest.json");
  if (!existsSync(manifestFile)) return;

  const password = process.env.PRIVATE_POST_PASSWORD;
  if (!password) {
    console.warn("未设置 PRIVATE_POST_PASSWORD，跳过清单更新；请运行 pnpm private:build 重新生成。");
    return;
  }

  const config = readConfig();
  const key = await createKey(password, config);
  const plaintext = await readPayload(manifestFile, key);
  if (!plaintext) {
    console.warn("无法解密 manifest.json，跳过清单更新；请运行 pnpm private:build 重新生成。");
    return;
  }

  const { posts } = JSON.parse(plaintext);
  const kept = posts.filter((post) => activeSlugs.has(post.url.replace("/private/", "")));
  if (kept.length !== posts.length) await writeManifest(kept, key, config);
}

export async function clean() {
  loadEnv();

  const entries = readEntries();
  const activeSlugs = new Set(entries.map((entry) => entry.name));
  cleanupStale(activeSlugs);
  await pruneManifest(activeSlugs);

  console.log("");
  console.log(`完成。当前隐私文章 ${entries.length} 篇。`);
}
