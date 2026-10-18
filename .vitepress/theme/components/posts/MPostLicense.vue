<!-- 文章协议卡片：位于正文末尾，展示本文的 CC BY-SA 4.0 授权信息、引用方式与协议入口。 -->

<script setup lang="ts">
import { computed, ref } from "vue";
import { useData } from "vitepress";
import { data as posts } from "../../features/posts/posts.data.ts";
import { usePageId } from "../../composables/usePageId";
import { ccBySvg, ccSaSvg, ccSvg } from "../../assets/icons.ts";

const AUTHOR = "Churk Ben";
const LICENSE = "CC BY-SA 4.0";
const LICENSE_DEED = "https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans";
const MARKS = [
  { label: "CC", svg: ccSvg },
  { label: "BY", svg: ccBySvg },
  { label: "SA", svg: ccSaSvg },
];

const pageId = usePageId();
const { frontmatter } = useData();
const copied = ref(false);
let resetTimer: number | undefined;

const post = computed(() => posts.find((item) => item.url === pageId.value.replace(/\/$/, "")));
const year = computed(() => post.value?.date.slice(0, 4) ?? "");
const visible = computed(() => Boolean(post.value) && frontmatter.value.license !== false);

async function copyAttribution() {
  if (!post.value) return;

  const url = window.location.href.split("#")[0];
  const attribution = `《${post.value.title}》 © ${year.value} ${AUTHOR}，采用 ${LICENSE} 协议授权。${url}`;

  try {
    await navigator.clipboard.writeText(attribution);
    copied.value = true;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => (copied.value = false), 2000);
  } catch {
    // 剪贴板不可用时保留原始按钮文案，用户仍可手动复制协议信息。
  }
}
</script>

<template>
  <section v-if="visible" class="m-license" aria-labelledby="m-license-title">
    <div class="m-license-watermark" aria-hidden="true" v-html="ccSvg"></div>

    <header class="m-license-head">
      <div class="m-license-marks" aria-hidden="true">
        <span v-for="mark in MARKS" :key="mark.label" class="m-license-mark" v-html="mark.svg"></span>
      </div>
      <p id="m-license-title" class="m-license-title" role="heading" aria-level="2">{{ LICENSE }}</p>
    </header>
    <p class="m-license-copy">可自由分享、演绎及商业使用；请署名并以相同协议共享改编作品。</p>

    <footer class="m-license-foot">
      <p class="m-license-credit">© {{ year }} {{ AUTHOR }}</p>
      <div class="m-license-actions">
        <button type="button" class="m-license-copy-btn" @click="copyAttribution">
          <span aria-live="polite">{{ copied ? "已复制引用" : "复制引用" }}</span>
        </button>
        <a class="m-license-link" rel="license noopener noreferrer" :href="LICENSE_DEED" target="_blank">协议说明</a>
      </div>
    </footer>
  </section>
</template>

<style lang="scss" scoped>
.m-license {
  position: relative;
  margin: 40px 0 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px 28px 20px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  isolation: isolate;
}

.m-license-watermark {
  position: absolute;
  top: 50%;
  right: -52px;
  z-index: -1;
  width: 210px;
  height: 210px;
  transform: translateY(-50%);
  color: var(--vp-c-text-1);
  opacity: 0.055;
  pointer-events: none;
  user-select: none;
}

.m-license-watermark :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.m-license-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}

.m-license-marks {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-brand-1);
}

.m-license-mark {
  display: inline-flex;
}

.m-license-mark :deep(svg) {
  display: block;
  width: 30px;
  height: 30px;
}

.m-license-title {
  margin: 0;
  border: 0;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 20px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
}

.m-license-copy {
  max-width: 62ch;
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.75;
}

.m-license-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 24px;
  margin-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 12px;
}

.m-license-credit {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.m-license-actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px 18px;
}

.m-license-copy-btn,
.m-license-link {
  color: var(--vp-c-text-2);
  font-size: 12px;
  text-decoration: none;
  white-space: nowrap;
  background: none;
  transition: color 0.2s;
}

.m-license-copy-btn {
  border: 0;
  padding: 0;
  cursor: pointer;
}

.m-license-copy-btn:hover,
.m-license-link:hover {
  color: var(--vp-c-brand-1);
}

.m-license-link {
  border-bottom: 1px solid transparent;
}

.m-license-link:hover {
  border-bottom-color: currentColor;
}

.m-license-copy-btn:focus-visible,
.m-license-link:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 4px;
  border-radius: 2px;
}

@media (max-width: 639px) {
  .m-license {
    margin-top: 36px;
    padding: 20px 18px 16px;
  }

  .m-license-watermark {
    right: -34px;
    width: 150px;
    height: 150px;
    opacity: 0.045;
  }

  .m-license-title {
    font-size: 18px;
  }

  .m-license-foot {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .m-license-copy-btn,
  .m-license-link {
    transition: none;
  }
}
</style>
