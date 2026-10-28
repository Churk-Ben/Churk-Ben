<!-- 文章列表：渲染日期、标题、标签与头图，供首页和归档复用。 -->

<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { getBannerSource } from "../../features/posts/banner.ts";
import { warmImage } from "../../features/cache/images.ts";
import type { Post } from "../../features/posts/types.ts";

const props = defineProps<{ posts: Post[] }>();

const items = computed(() =>
  props.posts.map((post) => ({
    ...post,
    bannerUrl: getBannerSource(post.banner, post.url.replace(/^\//, "")),
  })),
);
</script>

<template>
  <ul class="post-list">
    <li v-for="post in items" :key="post.url" class="post-item">
      <a
        class="post-link"
        :class="{ 'post-link--banner': post.bannerUrl }"
        :href="withBase(post.url)"
        @pointerenter="warmImage(post.bannerUrl)"
        @focus="warmImage(post.bannerUrl)"
      >
        <time class="post-date" :datetime="post.date">{{ post.date }}</time>
        <span class="post-info">
          <span class="post-title">{{ post.title }}</span>
          <span v-if="post.tags.length" class="post-tags">{{ post.tags.join(" · ") }}</span>
        </span>
        <span class="post-arrow" aria-hidden="true">↗</span>
        <span v-if="post.bannerUrl" class="post-banner" aria-hidden="true">
          <img :src="post.bannerUrl" alt="" loading="lazy" decoding="async" />
        </span>
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
  --post-banner-height: 96px;
  --post-banner-width: calc(var(--post-banner-height) * 3.3);
  position: relative;
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) 16px;
  align-items: baseline;
  gap: 16px;
  padding: 20px 0;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.post-link--banner {
  height: var(--post-banner-height);
  margin: 0;
  padding-block: 0;
  align-content: center;
  isolation: isolate;
}

.post-link--banner .post-info {
  padding-right: var(--post-banner-width);
}

.post-date,
.post-tags {
  color: var(--vp-c-text-2);
}

.post-date {
  white-space: nowrap;
}

.post-info {
  display: grid;
  gap: 4px;
}

.post-title {
  overflow-wrap: anywhere;
}

.post-arrow {
  position: relative;
  z-index: 1;
  color: var(--vp-c-text-3);
}

.post-banner {
  position: absolute;
  z-index: 0;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  width: var(--post-banner-width);
  height: var(--post-banner-height);
  overflow: hidden;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(
    to left,
    rgba(0, 0, 0, 1) 30%,
    rgba(0, 0, 0, 0.7) 40%,
    rgba(0, 0, 0, 0.3) 55%,
    rgba(0, 0, 0, 0.1) 75%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to left,
    rgba(0, 0, 0, 1) 30%,
    rgba(0, 0, 0, 0.7) 40%,
    rgba(0, 0, 0, 0.3) 55%,
    rgba(0, 0, 0, 0.1) 75%,
    transparent 100%
  );
}

.post-banner img {
  display: block;
  margin: 0;
  object-fit: cover;
  filter: blur(1px);
  transform: scale(1.01);
  transition:
    filter 0.3s ease,
    transform 0.3s ease;
}

.post-link:hover .post-banner img {
  filter: blur(0);
  transform: scale(1);
}

.post-link:hover .post-title,
.post-link:hover .post-arrow {
  color: var(--vp-c-brand-1);
}

@media (max-width: 899px) {
  .post-link {
    --post-banner-height: 80px;
  }
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

/* 窄屏下头图铺满整条，文字直接叠在图片上方。 */
@media (max-width: 639px) {
  .post-link--banner {
    grid-template-columns: minmax(0, 1fr) 16px;
    gap: 4px 12px;
    height: auto;
    aspect-ratio: 3.3 / 1;
    padding: 12px 0;
  }

  .post-link--banner .post-info {
    padding-right: 0;
  }

  .post-banner {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    aspect-ratio: auto;
    margin: 0;
  }

  .post-date,
  .post-info {
    position: relative;
    z-index: 1;
  }

  .post-date {
    grid-column: 1;
    grid-row: 1;
  }

  .post-info {
    grid-column: 1;
    grid-row: 2;
  }

  .post-arrow {
    grid-column: 2;
    grid-row: 1;
  }
}
</style>
