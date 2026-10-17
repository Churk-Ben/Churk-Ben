<!-- 评论区：主题启用评论且页面未关闭时，用 Giscus 按 pageId 渲染。 -->

<script setup lang="ts">
import { useData } from "vitepress";
import Giscus from "@giscus/vue";
import { usePageId } from "../../composables/usePageId";

const { isDark, theme, frontmatter } = useData();
const pageId = usePageId();
</script>

<template>
  <section v-if="theme.comment && frontmatter.comment !== false" class="doc-comments">
    <div class="doc-comments-body">
      <Giscus
        id="comments"
        v-bind="theme.comment"
        mapping="specific"
        :term="pageId"
        strict="1"
        reactions-enabled="1"
        emit-metadata="0"
        input-position="top"
        :theme="isDark ? 'noborder_dark' : 'noborder_light'"
        lang="zh-CN"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.doc-comments {
  margin: 40px 0 32px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 24px;
}

.doc-comments-body :deep(giscus-widget) {
  display: block;
  width: 100%;
}

.doc-comments-body :deep(iframe) {
  display: block;
  width: 100%;
  border: 0;
}
</style>
