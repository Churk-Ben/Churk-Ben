import { nextTick, provide, watch } from "vue";
import { inBrowser, useData } from "vitepress";

export function useAppearance() {
  const { isDark } = useData();

  watch(
    isDark,
    (dark) => {
      if (inBrowser) {
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#1b1b1f" : "#ffffff");
      }
    },
    { immediate: true },
  );

  provide("toggle-appearance", async ({ clientX: x, clientY: y }: MouseEvent) => {
    if (!document.startViewTransition || !matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      isDark.value = !isDark.value;
      return;
    }

    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];

    await document.startViewTransition(async () => {
      isDark.value = !isDark.value;
      await nextTick();
    }).ready;

    document.documentElement.animate(
      { clipPath: isDark.value ? clipPath.reverse() : clipPath },
      {
        duration: 300,
        easing: "ease-in",
        pseudoElement: `::view-transition-${isDark.value ? "old" : "new"}(root)`,
      },
    );
  });
}
