export interface EncryptedPayload {
  v: 2;
  kdf: "PBKDF2-SHA256";
  iterations: number;
  salt: string;
  iv: string;
  data: string;
}

interface CachedKey {
  id: string;
  key: string;
}

const STORAGE_KEY = "m-private-key";

function fromBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toBase64(bytes: ArrayBuffer) {
  const values = new Uint8Array(bytes);
  let binary = "";
  for (let index = 0; index < values.length; index += 1) {
    binary += String.fromCharCode(values[index]);
  }
  return btoa(binary);
}

function keyId(payload: EncryptedPayload) {
  return `${payload.iterations}:${payload.salt}`;
}

function readCache(): CachedKey | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as CachedKey) : null;
  } catch {
    return null;
  }
}

function writeCache(value: CachedKey | null) {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 隐私模式下 sessionStorage 可能不可用，忽略即可。
  }
}

export async function getCachedKey(payload: EncryptedPayload) {
  const cached = readCache();
  if (!cached || cached.id !== keyId(payload)) return null;

  try {
    return await crypto.subtle.importKey("raw", fromBase64(cached.key), { name: "AES-GCM" }, true, ["decrypt"]);
  } catch {
    clearCachedKey();
    return null;
  }
}

export async function deriveKey(password: string, payload: EncryptedPayload) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromBase64(payload.salt),
      iterations: payload.iterations,
    },
    material,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"],
  );
}

export async function cacheKey(key: CryptoKey, payload: EncryptedPayload) {
  try {
    const raw = await crypto.subtle.exportKey("raw", key);
    writeCache({ id: keyId(payload), key: toBase64(raw) });
  } catch {
    // 导出失败不影响本次解锁。
  }
}

export function clearCachedKey() {
  writeCache(null);
}

export async function decryptPayload(payload: EncryptedPayload, key: CryptoKey) {
  if (payload.v !== 2 || payload.kdf !== "PBKDF2-SHA256") {
    throw new Error("Unsupported private payload");
  }

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(payload.iv) },
    key,
    fromBase64(payload.data),
  );

  return new TextDecoder().decode(decrypted);
}
