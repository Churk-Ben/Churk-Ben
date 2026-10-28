<!-- 页面头图：读取 frontmatter.banner；false 关闭，文章缺省时自动匹配目录下的 banner / cover 图片。 -->

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useData } from "vitepress";
import { useLayout } from "vitepress/theme";
import { data as posts } from "../../features/posts/posts.data.ts";
import { getBannerSource } from "../../features/posts/banner.ts";
import { getBannerPlaceholder } from "../../features/cache/placeholders.ts";
import { preloadImage } from "../../features/cache/images.ts";
import { usePageId } from "../../composables/usePageId";

const pageId = usePageId();
const { frontmatter } = useData();
const { hasAside } = useLayout();

const post = computed(() => posts.find((item) => item.url === pageId.value.replace(/\/$/, "")));
const directory = computed(() => post.value?.url.replace(/^\//, "") ?? "");

// 文章页按目录自动匹配头图；非文章页没有目录，只认 frontmatter.banner 的显式路径。
const source = computed(() => getBannerSource(frontmatter.value.banner, directory.value));

// 首屏直接使用服务端渲染的地址；站内切换时先隐藏旧图，等新图解码完再淡入，
// 避免旧头图占位到新图加载完成，出现“脏图”残留。
const displayed = ref(source.value);
const placeholder = computed(() => getBannerPlaceholder(source.value));
const image = ref<HTMLImageElement | null>(null);
const ready = ref(false);
let request = 0;

function onImageLoad(event: Event) {
  const target = event.currentTarget as HTMLImageElement;
  if (target.getAttribute("src") === source.value) ready.value = true;
}

onMounted(() => {
  if (image.value?.complete && image.value.getAttribute("src") === source.value) ready.value = true;
});

watch(source, async (value) => {
  const current = ++request;

  if (!value) {
    displayed.value = "";
    ready.value = false;
    return;
  }

  if (value === displayed.value) return;

  ready.value = false;

  try {
    await preloadImage(value);
  } catch {
    return;
  }

  if (current !== request) return;

  displayed.value = value;
});
</script>

<template>
  <div v-if="source" class="m-post-banner" :class="{ 'm-post-banner--aside': hasAside }">
    <figure class="m-post-banner-frame">
      <img
        v-if="placeholder"
        class="m-post-banner-blur"
        :class="{ 'is-ready': ready }"
        :src="placeholder"
        alt=""
        aria-hidden="true"
      />
      <img
        ref="image"
        :key="displayed"
        class="m-post-banner-content"
        :class="{ 'is-ready': ready }"
        :src="displayed"
        :alt="post ? `${post.title} 头图` : '页面头图'"
        loading="eager"
        decoding="async"
        fetchpriority="high"
        @load="onImageLoad"
        @error="onImageLoad"
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
  position: relative;
  margin: 0;
  border-radius: 24px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.m-post-banner-content {
  display: block;
  width: 100%;
  height: auto;
  opacity: 1;
  transition: opacity 0.25s ease;
}

.m-post-banner-blur {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(16px);
  transform: scale(1.08);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

/* 有脚本时先显示模糊图，原图加载完成后再淡入；禁用脚本则直接展示原图。 */
@media (scripting: enabled) {
  .m-post-banner-content {
    opacity: 0;
  }

  .m-post-banner-content.is-ready {
    opacity: 1;
  }

  .m-post-banner-blur {
    opacity: 1;
  }

  .m-post-banner-blur.is-ready {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .m-post-banner-content,
  .m-post-banner-blur {
    transition: none;
  }
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
