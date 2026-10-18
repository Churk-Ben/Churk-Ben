<!-- 页面头图：读取 frontmatter.banner；false 关闭，文章缺省时自动匹配目录下的 banner / cover 图片。 -->

<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { useLayout } from "vitepress/theme";
import { data as posts } from "../../features/posts/posts.data.ts";
import { getBannerSource } from "../../features/posts/banner.ts";
import { usePageId } from "../../composables/usePageId";

const pageId = usePageId();
const { frontmatter } = useData();
const { hasAside } = useLayout();

const post = computed(() => posts.find((item) => item.url === pageId.value.replace(/\/$/, "")));
const directory = computed(() => post.value?.url.replace(/^\//, "") ?? "");

// 文章页按目录自动匹配头图；非文章页没有目录，只认 frontmatter.banner 的显式路径。
const source = computed(() => getBannerSource(frontmatter.value.banner, directory.value));
</script>

<template>
  <div v-if="source" class="m-post-banner" :class="{ 'm-post-banner--aside': hasAside }">
    <figure class="m-post-banner-frame">
      <img
        :src="source"
        :alt="post ? `${post.title} 头图` : '页面头图'"
        loading="eager"
        decoding="async"
        fetchpriority="high"
      />
    </figure>
  </div>
</template>

<style lang="scss" scoped>
.m-post-banner {
  max-width: 1120px;
  margin: 0 auto 28px;
  box-sizing: border-box;
}

.m-post-banner-frame {
  margin: 0;
  border-radius: 24px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.m-post-banner img {
  display: block;
  width: 100%;
  height: auto;
}

/* 宽屏下右侧目录是 fixed 定位，给卡片留出目录宽度避免遮挡。 */
@media (min-width: 1280px) {
  .m-post-banner--aside {
    max-width: calc(1120px + 16rem);
    padding-right: 16rem;
  }
}

@media (max-width: 639px) {
  .m-post-banner {
    margin-bottom: 20px;
  }

  .m-post-banner-frame {
    border-radius: 16px;
  }
}
</style>
