<!-- 文章列表：渲染日期、标题与标签，供首页和归档复用。 -->

<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { getBannerSource } from "../../features/posts/banner.ts";
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
      <a class="post-link" :class="{ 'post-link--banner': post.bannerUrl }" :href="withBase(post.url)">
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
  --post-banner-width: clamp(112px, 24%, 176px);
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
  min-height: calc(var(--post-banner-width) * 0.5625 + 40px);
  align-content: center;
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
  color: var(--vp-c-text-3);
}

.post-link--banner .post-arrow {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  align-self: center;
  justify-self: end;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--vp-c-bg) 66%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-border) 35%, transparent);
  color: var(--vp-c-text-1);
  font-size: 12px;
  line-height: 1;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}

.post-banner {
  position: absolute;
  top: 50%;
  right: 0;
  width: var(--post-banner-width);
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 10px;
  pointer-events: none;
  transform: translateY(-50%);
}

.post-banner img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  -webkit-mask-image: linear-gradient(to left, #000 58%, transparent 100%);
  mask-image: linear-gradient(to left, #000 58%, transparent 100%);
}

/* 左侧叠加由右至左渐强的模糊，与图片自身的淡出叠合。 */
.post-banner::after {
  position: absolute;
  inset: 0;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  -webkit-mask-image: linear-gradient(to left, transparent 35%, #000 100%);
  mask-image: linear-gradient(to left, transparent 35%, #000 100%);
  pointer-events: none;
  content: "";
}

.post-link:hover .post-title,
.post-link:hover .post-arrow {
  color: var(--vp-c-brand-1);
}

@media (max-width: 479px) {
  .post-link {
    --post-banner-width: 104px;
    grid-template-columns: minmax(0, 1fr) 16px;
    gap: 4px 12px;
    padding: 16px 0;
  }

  .post-link--banner {
    min-height: calc(var(--post-banner-width) * 0.5625 + 32px);
  }

  .post-banner {
    border-radius: 8px;
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
