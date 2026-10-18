import { ref } from "vue";
import { withBase } from "vitepress";
import type { Post } from "../posts/types.ts";
import { cacheKey, clearCachedKey, decryptPayload, deriveKey, getCachedKey, type EncryptedPayload } from "./crypto.ts";

export interface PrivateOutlineItem {
  id: string;
  text: string;
  level: number;
}

const MANIFEST = "/private/manifest.json";
const VISIBLE_KEY = "m-private-visible";

const visible = ref(false);
const ready = ref(false);
const posts = ref<Post[]>([]);
const outline = ref<PrivateOutlineItem[]>([]);

let manifest: EncryptedPayload | null = null;
let manifestPromise: Promise<EncryptedPayload> | null = null;
let initPromise: Promise<void> | null = null;

function loadManifest() {
  if (manifestPromise) return manifestPromise;

  manifestPromise = fetch(withBase(MANIFEST), { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      manifest = (await response.json()) as EncryptedPayload;
      return manifest;
    })
    .catch((reason) => {
      manifestPromise = null;
      throw reason;
    });

  return manifestPromise;
}

function setVisibleFlag(value: boolean) {
  try {
    if (value) sessionStorage.setItem(VISIBLE_KEY, "1");
    else sessionStorage.removeItem(VISIBLE_KEY);
  } catch {
    // 隐私模式下 sessionStorage 可能不可用。
  }
}

function clear() {
  clearCachedKey();
  posts.value = [];
  visible.value = false;
  setVisibleFlag(false);
}

async function decryptManifest(payload: EncryptedPayload, key: CryptoKey) {
  const data = JSON.parse(await decryptPayload(payload, key)) as { posts: Post[] };
  posts.value = data.posts;
  visible.value = true;
  setVisibleFlag(true);
}

/** 页面加载时恢复同一标签页里的解锁状态。 */
export function initPrivateVault() {
  if (typeof window === "undefined") return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (visible.value) {
      ready.value = true;
      return;
    }

    let flagged = false;
    try {
      flagged = sessionStorage.getItem(VISIBLE_KEY) === "1";
    } catch {
      flagged = false;
    }

    if (!flagged) {
      ready.value = true;
      return;
    }

    try {
      const payload = await loadManifest();
      const key = await getCachedKey(payload);
      if (!key) throw new Error("Missing key");
      await decryptManifest(payload, key);
    } catch {
      clear();
    } finally {
      ready.value = true;
    }
  })();

  return initPromise.finally(() => {
    initPromise = null;
  });
}

/** 用密码解锁清单；成功返回 true。 */
export async function unlockPrivateVault(password: string) {
  try {
    const payload = manifest ?? (await loadManifest());
    const key = await deriveKey(password, payload);
    await cacheKey(key, payload);
    try {
      await decryptManifest(payload, key);
    } catch (reason) {
      clearCachedKey();
      throw reason;
    }
    ready.value = true;
    return true;
  } catch {
    clear();
    ready.value = true;
    return false;
  }
}

/** 隐藏侧栏并清除会话密钥。 */
export function lockPrivateVault() {
  clear();
}

export function setPrivateOutline(items: PrivateOutlineItem[]) {
  outline.value = items;
}

export function clearPrivateOutline() {
  outline.value = [];
}

export function usePrivateVault() {
  return {
    visible,
    ready,
    posts,
    outline,
    init: initPrivateVault,
    unlock: unlockPrivateVault,
    lock: lockPrivateVault,
    setOutline: setPrivateOutline,
    clearOutline: clearPrivateOutline,
  };
}
