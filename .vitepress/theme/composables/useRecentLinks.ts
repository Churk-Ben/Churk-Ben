import { onMounted, ref } from "vue";
import { navData } from "../features/nav/data.ts";
import type { NavLink } from "../features/nav/types.ts";

const storageKey = "churk-ben-recent-links";
const linksByUrl = new Map(navData.flatMap((group) => group.items).map((item) => [item.link, item]));

export function useRecentLinks() {
  const items = ref<NavLink[]>([]);

  onMounted(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      if (Array.isArray(saved)) {
        // Read the old object format too; canonical labels and icons always come from navData.
        items.value = saved
          .map((value) => linksByUrl.get(typeof value === "string" ? value : value?.link))
          .filter((item): item is NavLink => Boolean(item))
          .slice(0, 4);
      }
    } catch {
      // Browser storage is optional; an in-memory history remains available.
    }
  });

  const remember = (item: NavLink) => {
    items.value = [item, ...items.value.filter((link) => link.link !== item.link)].slice(0, 4);
    try {
      localStorage.setItem(storageKey, JSON.stringify(items.value.map((link) => link.link)));
    } catch {
      // Keep the current history when persistent storage is unavailable.
    }
  };

  return { items, remember };
}
