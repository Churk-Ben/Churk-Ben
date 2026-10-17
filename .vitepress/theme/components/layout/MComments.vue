<!-- 评论区：主题启用评论且页面未关闭时，用 Giscus 按 pageId 渲染。 -->

<script setup lang="ts">
import { useData } from "vitepress";
import Giscus from "@giscus/vue";
import { usePageId } from "../../composables/usePageId";

const { isDark, theme, frontmatter } = useData();
const pageId = usePageId();
</script>

<template>
  <div v-if="theme.comment && frontmatter.comment !== false" class="doc-comments">
    <Giscus
      id="comments"
      v-bind="theme.comment"
      mapping="specific"
      :term="pageId"
      strict="1"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="top"
      :theme="isDark ? 'dark' : 'light'"
      lang="zh-CN"
      loading="lazy"
    />
  </div>
</template>

<style lang="scss" scoped>
.doc-comments {
  margin: 24px 0 48px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 24px;
}
</style>
