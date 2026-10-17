<!-- 文章翻页：按发布时间在文章之间跳转，替代依赖侧栏的默认翻页。 -->

<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { data as posts } from "../../features/posts/posts.data.ts";
import { usePageId } from "../../composables/usePageId";

const pageId = usePageId();

const index = computed(() => posts.findIndex((post) => post.url === pageId.value));
const previous = computed(() => (index.value > 0 ? posts[index.value - 1] : undefined));
const next = computed(() => (index.value >= 0 ? posts[index.value + 1] : undefined));
</script>

<template>
  <nav
    v-if="previous || next"
    class="m-post-pager"
    :class="{ 'm-post-pager--next-only': next && !previous }"
    aria-label="文章翻页"
  >
    <a v-if="previous" class="m-post-pager-link" :href="withBase(previous.url)">
      <span class="m-post-pager-label">上一篇</span>
      <span class="m-post-pager-title">{{ previous.title }}</span>
    </a>
    <a v-if="next" class="m-post-pager-link m-post-pager-link--next" :href="withBase(next.url)">
      <span class="m-post-pager-label">下一篇</span>
      <span class="m-post-pager-title">{{ next.title }}</span>
    </a>
  </nav>
</template>

<style lang="scss" scoped>
.m-post-pager {
  display: grid;
  gap: 12px;
  margin-top: 32px;
}

.m-post-pager-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px 16px;
  text-decoration: none;
  transition: border-color 0.2s;
}

.m-post-pager-link:hover {
  border-color: var(--vp-c-brand-1);
}

.m-post-pager-link--next {
  text-align: right;
}

.m-post-pager-label {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.m-post-pager-title {
  color: var(--vp-c-brand-1);
  font-size: 14px;
}

@media (min-width: 640px) {
  .m-post-pager {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .m-post-pager--next-only .m-post-pager-link--next {
    grid-column: 2;
  }
}
</style>
