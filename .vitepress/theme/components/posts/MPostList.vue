<script setup lang="ts">
import { withBase } from "vitepress";
import type { Post } from "../../features/posts/types.ts";

defineProps<{ posts: Post[] }>();
</script>

<template>
  <ul class="post-list">
    <li v-for="post in posts" :key="post.url" class="post-item">
      <a class="post-link" :href="withBase(post.url)">
        <time class="post-date" :datetime="post.date">{{ post.date }}</time>
        <span class="post-info">
          <span class="post-title">{{ post.title }}</span>
          <span v-if="post.tags.length" class="post-tags">{{ post.tags.join(" · ") }}</span>
        </span>
        <span class="post-arrow" aria-hidden="true">↗</span>
      </a>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.post-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.post-item + .post-item {
  margin-top: 0;
  border-top: 1px solid var(--vp-c-divider);
}

.post-link {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) 16px;
  align-items: baseline;
  gap: 16px;
  padding: 20px 0;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.post-date,
.post-tags {
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 400;
  line-height: 22px;
}

.post-date {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.post-info {
  display: grid;
  gap: 4px;
}

.post-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 26px;
  overflow-wrap: anywhere;
}

.post-arrow {
  color: var(--vp-c-text-3);
  font-size: 14px;
}

.post-link:hover .post-title,
.post-link:hover .post-arrow {
  color: var(--vp-c-brand-1);
}

@media (max-width: 479px) {
  .post-link {
    grid-template-columns: minmax(0, 1fr) 16px;
    gap: 4px 12px;
    padding: 16px 0;
  }

  .post-date {
    grid-column: 1;
  }

  .post-info {
    grid-column: 1;
  }

  .post-arrow {
    grid-column: 2;
    grid-row: 2;
  }
}
</style>
