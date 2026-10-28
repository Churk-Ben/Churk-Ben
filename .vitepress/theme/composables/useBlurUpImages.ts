import { onMounted, onUnmounted } from "vue";
import { onContentUpdated } from "vitepress";

const SELECTOR = ".m-image img.m-image-content";
const tracked = new WeakSet<HTMLImageElement>();

function markLoaded(image: HTMLImageElement) {
  image.closest(".m-image")?.classList.add("is-loaded");
}

function track(image: HTMLImageElement) {
  if (tracked.has(image)) return;
  tracked.add(image);

  if (image.complete) {
    markLoaded(image);
    return;
  }

  const done = () => markLoaded(image);
  image.addEventListener("load", done, { once: true });
  image.addEventListener("error", done, { once: true });
}

/** 给正文模糊占位图标记“原图已加载”，由全局 CSS 完成淡入。 */
export function useBlurUpImages() {
  if (import.meta.env.SSR) return;

  const scan = () => {
    for (const image of document.querySelectorAll<HTMLImageElement>(SELECTOR)) track(image);
  };

  onMounted(() => {
    scan();
    window.addEventListener("private-post:rendered", scan);
  });
  onContentUpdated(scan);
  onUnmounted(() => {
    window.removeEventListener("private-post:rendered", scan);
  });
}
