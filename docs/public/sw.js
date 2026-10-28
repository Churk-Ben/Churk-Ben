/**
 * 站点静态资源缓存。
 *
 * - 页面导航：network-first，离线时回退到缓存，避免发布后看到旧 HTML。
 * - /assets/ 下的哈希资源：cache-first，文件名变化即缓存键变化。
 * - 图片：/assets/ 下为 cache-first，其余（public 图片）用 stale-while-revalidate。
 * - 其他同源 GET（如 hashmap.json）保持网络请求，避免缓存构建元数据。
 *
 * 修改缓存策略时同步更新 VERSION，激活阶段会清掉旧版本缓存。
 */
const CACHE_PREFIX = "churk-ben";
const VERSION = "v1";
const PAGE_CACHE = `${CACHE_PREFIX}-pages-${VERSION}`;
const ASSET_CACHE = `${CACHE_PREFIX}-assets-${VERSION}`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-${VERSION}`;
const CURRENT_CACHES = new Set([PAGE_CACHE, ASSET_CACHE, IMAGE_CACHE]);

const MAX_PAGES = 12;
const MAX_ASSETS = 240;
const MAX_IMAGES = 160;

const IMAGE_PATTERN = /\.(?:avif|webp|png|jpe?g|gif|svg|ico)$/i;
const ASSET_ROOT = new URL("assets/", self.registration.scope).pathname;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key.startsWith(CACHE_PREFIX) && !CURRENT_CACHES.has(key)).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, PAGE_CACHE, MAX_PAGES, event));
    return;
  }

  if (IMAGE_PATTERN.test(url.pathname)) {
    event.respondWith(
      url.pathname.startsWith(ASSET_ROOT)
        ? cacheFirst(request, IMAGE_CACHE, MAX_IMAGES, event)
        : staleWhileRevalidate(request, IMAGE_CACHE, MAX_IMAGES, event),
    );
    return;
  }

  if (url.pathname.startsWith(ASSET_ROOT)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE, MAX_ASSETS, event));
  }
});

async function cacheFirst(request, cacheName, maxEntries, event) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) event.waitUntil(store(cache, request, response, maxEntries));
  return response;
}

async function staleWhileRevalidate(request, cacheName, maxEntries, event) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) return store(cache, request, response, maxEntries).then(() => response);
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(network);
    return cached;
  }

  return (await network) ?? Response.error();
}

async function networkFirst(request, cacheName, maxEntries, event) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) event.waitUntil(store(cache, request, response, maxEntries));
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? Response.error();
  }
}

async function store(cache, request, response, maxEntries) {
  if (!response.ok || response.type !== "basic") return;

  try {
    await cache.put(request, response.clone());
    await trim(cache, maxEntries);
  } catch {
    // 配额不足或响应不可缓存时放弃，不能影响本次请求。
  }
}

async function trim(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;

  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}
