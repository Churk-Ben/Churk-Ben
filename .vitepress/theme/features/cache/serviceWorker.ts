import { withBase } from "vitepress";

/**
 * 注册静态资源缓存 Service Worker。
 *
 * GitHub Pages 对静态文件只给很短的浏览器缓存时间，图片每次重新访问都要再
 * 下一次网络。Service Worker 会把哈希资源、图片和字体保存在 Cache Storage
 * 中，跨页面、跨会话直接读取；开发环境不注册，避免干扰热更新。
 */
export function registerServiceWorker() {
  if (typeof window === "undefined" || !import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  const register = () => {
    navigator.serviceWorker
      .register(withBase("/sw.js"), { scope: withBase("/"), updateViaCache: "none" })
      .catch((error) => {
        console.warn("[cache] Service Worker 注册失败", error);
      });
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
