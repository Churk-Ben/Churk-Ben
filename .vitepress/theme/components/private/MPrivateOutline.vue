<!-- 隐私文章大纲：正文在客户端解密，因此从解出的标题生成右侧目录。 -->

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useData } from "vitepress";
import { usePageId } from "../../composables/usePageId";
import { usePrivateVault } from "../../features/private/vault.ts";

const { theme } = useData();
const pageId = usePageId();
const vault = usePrivateVault();
const activeId = ref("");

const isPrivatePost = computed(
  () => pageId.value.startsWith("/private/") && pageId.value.replace(/\/$/, "") !== "/private",
);
const items = computed(() => (isPrivatePost.value ? vault.outline.value : []));
const title = computed(() => theme.value.outlineTitle ?? "本页目录");

function updateActive() {
  if (!items.value.length) return;

  let current = items.value[0].id;
  for (const item of items.value) {
    const element = document.getElementById(item.id);
    if (element && element.getBoundingClientRect().top <= 140) current = item.id;
  }
  activeId.value = current;
}

function onScroll() {
  updateActive();
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  void nextTick(updateActive);
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});

watch(items, () => {
  void nextTick(updateActive);
});
</script>

<template>
  <nav v-if="items.length" class="m-private-outline" :aria-label="title">
    <p class="m-private-outline-title">{{ title }}</p>
    <ul>
      <li v-for="item in items" :key="item.id" :class="`level-${item.level}`">
        <a :href="`#${item.id}`" :class="{ active: activeId === item.id }" @click="activeId = item.id">
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.m-private-outline {
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
}

.m-private-outline-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 2.2857143;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

a {
  display: block;
  padding: 0.25rem 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  text-decoration: none;
  transition: color 0.25s;
}

a:hover,
a.active {
  color: var(--vp-c-brand-1);
}

.level-3 a {
  padding-left: 1rem;
}

.level-4 a {
  padding-left: 2rem;
}
</style>
