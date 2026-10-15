<script setup lang="ts">
import { computed, ref } from "vue";
import { data as posts } from "./posts.data";
import { groupPostsByYear, postFilters } from "./posts";
import MPostList from "./MPostList.vue";

const selectedTag = ref("全部");
const filteredPosts = computed(() =>
  posts.filter((post) => selectedTag.value === "全部" || post.tags.includes(selectedTag.value)),
);
const groups = computed(() => groupPostsByYear(filteredPosts.value));
</script>

<template>
  <div class="post-archive">
    <div class="archive-toolbar">
      <div class="archive-filters" role="group" aria-label="按文章标签筛选">
        <button
          v-for="tag in postFilters"
          :key="tag"
          type="button"
          :aria-pressed="selectedTag === tag"
          @click="selectedTag = tag"
        >
          {{ tag }}
        </button>
      </div>
      <span class="archive-count" role="status">{{ filteredPosts.length }} 篇文章</span>
    </div>
    <section v-for="group in groups" :key="group.year" :aria-labelledby="`year-${group.year}`" class="archive-year">
      <h2 :id="`year-${group.year}`">
        {{ group.year }} <span>{{ group.posts.length }} 篇</span>
      </h2>
      <MPostList :posts="group.posts" />
    </section>
  </div>
</template>

<style scoped>
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
  font-size: 13px;
  line-height: 24px;
}

.archive-filters button:hover {
  color: var(--vp-c-brand-1);
}

.archive-filters button[aria-pressed="true"] {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.archive-count,
.archive-year h2 span {
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 400;
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
  font-size: 24px;
  line-height: 32px;
  font-variant-numeric: tabular-nums;
}
</style>
