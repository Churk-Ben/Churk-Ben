<!-- 隐私文章归档：未解锁时在标题旁用六位圆点解锁，解锁后按标签筛选并按年份展示。 -->

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { postFilters } from "../../features/posts/data.ts";
import { usePrivateVault } from "../../features/private/vault.ts";
import type { Post } from "../../features/posts/types.ts";
import MPrivateCode from "./MPrivateCode.vue";
import MPrivateList from "./MPrivateList.vue";

const vault = usePrivateVault();
const selectedTag = ref("全部");
const redirect = ref("");
const code = ref("111111");
const armed = ref(false);
let suppressWatch = false;
let timer: number | undefined;

function randomCode() {
  return Array.from({ length: 6 }, () => 1 + Math.floor(Math.random() * 3)).join("");
}

function randomizeCode() {
  suppressWatch = true;
  code.value = randomCode();
  void nextTick(() => {
    suppressWatch = false;
  });
}

function groupPostsByYear(items: Post[]) {
  const years = new Map<string, Post[]>();
  for (const post of items) {
    const year = post.date.slice(0, 4);
    const group = years.get(year) ?? [];
    group.push(post);
    years.set(year, group);
  }
  return [...years].map(([year, posts]) => ({ year, posts }));
}

const tags = computed(() => [...new Set([...postFilters, ...vault.posts.value.flatMap((post) => post.tags)])]);
const filteredPosts = computed(() =>
  vault.posts.value.filter((post) => selectedTag.value === "全部" || post.tags.includes(selectedTag.value)),
);
const groups = computed(() => groupPostsByYear(filteredPosts.value));

watch(tags, (value) => {
  if (!value.includes(selectedTag.value)) selectedTag.value = "全部";
});

watch(code, (value) => {
  if (suppressWatch || !armed.value || vault.visible.value) return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    void vault.unlock(value);
  }, 350);
});

function readRedirect() {
  if (typeof window === "undefined") return "";
  const value = new URLSearchParams(window.location.search).get("redirect") ?? "";
  if (!value.startsWith("/") || value.startsWith("//")) return "";
  if (value === "/private" || value === "/private/") return "";
  return value;
}

function goRedirect() {
  if (vault.visible.value && redirect.value) {
    window.location.replace(redirect.value);
  }
}

function lock() {
  vault.lock();
  randomizeCode();
}

onMounted(async () => {
  redirect.value = readRedirect();
  await vault.init();
  if (!vault.visible.value) {
    randomizeCode();
    armed.value = true;
  }
  goRedirect();
});

onUnmounted(() => {
  window.clearTimeout(timer);
});

watch(
  () => vault.visible.value,
  (visible) => {
    if (visible) goRedirect();
  },
);
</script>

<template>
  <header class="private-archive-head">
    <h1 class="private-archive-title">隐私文章</h1>
    <MPrivateCode v-if="vault.ready.value && !vault.visible.value" v-model="code" />
  </header>

  <p v-if="!vault.ready.value" class="private-archive-loading" role="status">正在加载隐私文章…</p>

  <div v-else-if="vault.visible.value" class="post-archive">
    <div class="archive-toolbar">
      <div class="archive-filters" role="group" aria-label="按隐私文章标签筛选">
        <button
          v-for="tag in tags"
          :key="tag"
          type="button"
          :aria-pressed="selectedTag === tag"
          @click="selectedTag = tag"
        >
          {{ tag }}
        </button>
      </div>
      <div class="archive-meta">
        <span class="archive-count" role="status">{{ filteredPosts.length }} 篇文章</span>
        <button type="button" class="archive-lock" @click="lock">锁定</button>
      </div>
    </div>

    <p v-if="!filteredPosts.length" class="archive-empty">还没有隐私文章。</p>

    <section
      v-for="group in groups"
      :key="group.year"
      :aria-labelledby="`private-year-${group.year}`"
      class="archive-year"
    >
      <h2 :id="`private-year-${group.year}`">
        {{ group.year }} <span>{{ group.posts.length }} 篇</span>
      </h2>
      <MPrivateList :posts="group.posts" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.private-archive-head {
  display: flex;
  align-items: center;
  gap: 16px;
}

.private-archive-title {
  margin: 0;
  border: 0;
  padding: 0;
}

.archive-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
  margin: 28px 0 40px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 20px;
}

.archive-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.archive-filters button {
  border-radius: 6px;
  padding: 5px 12px;
  color: var(--vp-c-text-2);
}

.archive-filters button:hover {
  color: var(--vp-c-brand-1);
}

.archive-filters button[aria-pressed="true"] {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.archive-meta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.archive-count,
.archive-year h2 span {
  color: var(--vp-c-text-2);
}

.archive-lock {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 3px 12px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  background: transparent;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.archive-lock:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.archive-empty,
.private-archive-loading {
  margin: 24px 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.archive-year + .archive-year {
  margin-top: 36px;
}

.archive-year h2 {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 0 0 8px;
  border: 0;
  padding: 0;
}
</style>
