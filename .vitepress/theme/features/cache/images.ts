/**
 * 图片预加载与去重。
 *
 * 同一地址在并发请求时只创建一个 Image，加载并解码完成后再交给页面使用；
 * 浏览器与 Service Worker 会复用已经下载的字节，切换页面时不需要重新等待网络。
 */
const pending = new Map<string, Promise<void>>();

/** 预加载并解码图片；结束后清掉进行中的记录，失败时允许下次重试。 */
export function preloadImage(source: string) {
  const existing = pending.get(source);
  if (existing) return existing;

  const task = new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      const done = () => resolve();
      if (typeof image.decode === "function") image.decode().then(done, done);
      else done();
    };
    image.onerror = () => {
      reject(new Error(`图片加载失败：${source}`));
    };
    image.src = source;
  });

  pending.set(source, task);
  void task
    .finally(() => {
      if (pending.get(source) === task) pending.delete(source);
    })
    .catch(() => {});
  return task;
}

/** 交互触发的低优先级预热，失败时保持静默。 */
export function warmImage(source?: string | null) {
  if (!source) return;
  void preloadImage(source).catch(() => {});
}
