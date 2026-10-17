<!-- 首页文章区：展示最近 4 篇文章与“从这里开始”的阅读路径。 -->

<script setup lang="ts">
import { withBase } from "vitepress";
import { data as posts } from "../../features/posts/posts.data.ts";
import { readingPaths } from "../../features/posts/data.ts";
import MPostList from "./MPostList.vue";
</script>

<template>
  <div class="home-content">
    <section aria-labelledby="recent-posts">
      <div class="section-heading">
        <h2 id="recent-posts">最近文章</h2>
        <a class="all-posts" :href="withBase('/posts/')"
          >全部 {{ posts.length }} 篇 <span aria-hidden="true">→</span></a
        >
      </div>
      <MPostList :posts="posts.slice(0, 4)" />
    </section>

    <section class="reading-paths" aria-labelledby="reading-paths">
      <h2 id="reading-paths">从这里开始</h2>
      <p class="section-note">沿着一个主题，慢慢读。</p>
      <a v-for="item in readingPaths" :key="item.url" class="series-link" :href="withBase(item.url)">
        <span class="series-title">{{ item.title }} <span aria-hidden="true">→</span></span>
        <span class="series-desc">{{ item.desc }}</span>
      </a>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home-content {
  display: grid;
  gap: 40px;
  max-width: 1152px;
  margin: 8px auto 0;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 36px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}

.home-content h2 {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 20px;
  line-height: 28px;
  letter-spacing: 0;
}

.all-posts {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 400;
  text-decoration: none;
}

.home-content .section-note {
  margin: 8px 0 20px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.series-link {
  display: grid;
  gap: 6px;
  padding: 16px 0;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.series-link + .series-link {
  border-top: 1px solid var(--vp-c-divider);
}

.series-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  line-height: 24px;
}

.series-title > span {
  color: var(--vp-c-text-3);
}

.series-link:hover .series-title {
  color: var(--vp-c-brand-1);
}

.series-desc {
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 400;
  line-height: 24px;
}

@media (min-width: 960px) {
  .home-content {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 56px;
    padding-top: 40px;
  }

  .reading-paths {
    border-left: 1px solid var(--vp-c-divider);
    padding-left: 40px;
  }
}
</style>
