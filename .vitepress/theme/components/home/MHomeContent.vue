<!-- 首页文章区：展示最近 4 篇文章与推荐阅读。 -->

<script setup lang="ts">
import { withBase } from "vitepress";
import { data as posts } from "../../features/posts/posts.data.ts";
import { recommendations } from "../../features/home/data.ts";
import MPostList from "../posts/MPostList.vue";
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

    <section class="recommendations" aria-labelledby="recommendations">
      <h2 id="recommendations">推荐</h2>
      <a v-for="item in recommendations" :key="item.url" class="recommendation-link" :href="withBase(item.url)">
        <span class="recommendation-info">
          <span class="recommendation-title">{{ item.title }}</span>
          <span class="recommendation-desc">{{ item.desc }}</span>
        </span>
        <span class="recommendation-arrow" aria-hidden="true">↗</span>
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
}

.all-posts {
  flex-shrink: 0;
  text-decoration: none;
}

.recommendation-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16px;
  align-items: baseline;
  gap: 16px;
  padding: 20px 0;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.recommendation-link + .recommendation-link {
  border-top: 1px solid var(--vp-c-divider);
}

.recommendation-info {
  display: grid;
  gap: 4px;
}

.recommendation-title {
  overflow-wrap: anywhere;
}

.recommendation-arrow {
  color: var(--vp-c-text-3);
}

.recommendation-link:hover .recommendation-title,
.recommendation-link:hover .recommendation-arrow {
  color: var(--vp-c-brand-1);
}

.recommendation-desc {
  color: var(--vp-c-text-2);
}

@media (min-width: 960px) {
  .home-content {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 56px;
    padding-top: 40px;
  }

  .recommendations {
    border-left: 1px solid var(--vp-c-divider);
    padding-left: 40px;
  }
}

@media (max-width: 479px) {
  .recommendation-link {
    padding: 16px 0;
  }
}
</style>
