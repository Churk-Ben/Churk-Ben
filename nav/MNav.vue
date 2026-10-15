<script setup lang="ts">
import { onMounted, ref } from "vue";

import type { NavLink } from "../.vitepress/theme/types";
import { NAV_DATA } from "./data";

const M_RECENT_LINKS_KEY = "churk-ben-recent-links";

const getItems = () => {
  try {
    const value = JSON.parse(localStorage.getItem(M_RECENT_LINKS_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item) => item && typeof item.link === "string" && typeof item.title === "string").slice(0, 4)
      : [];
  } catch {
    return [];
  }
};

const items = ref<NavLink[]>([]);

onMounted(() => {
  items.value = getItems();
});

const handleClick = (data: NavLink) => {
  let newData = items.value.filter((item) => item.link !== data.link);
  newData.unshift(data);
  if (newData.length > 4) {
    newData = newData.slice(0, 4);
  }
  items.value = newData;
  try {
    localStorage.setItem(M_RECENT_LINKS_KEY, JSON.stringify(newData));
  } catch {
    // 最近使用仍可在当前页面生效。
  }
};
</script>

<template>
  <MNavLinks v-if="items.length" title="最近使用" @nav-click="handleClick" :items="items" />
  <MNavLinks v-for="item in NAV_DATA" :key="item.title" v-bind="item" @nav-click="handleClick" />
</template>
