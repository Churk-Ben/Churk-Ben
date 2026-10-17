<!-- 文档页脚：在带侧栏的文档页显示页脚公告与版权。 -->

<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { useLayout } from "vitepress/theme";

const { theme } = useData();
const footer = computed(() => theme.value.footer);
const { hasSidebar } = useLayout();

const isDocFooterVisible = computed(() => {
  return hasSidebar.value && Boolean(footer.value?.message || footer.value?.copyright);
});
</script>

<template>
  <div v-if="isDocFooterVisible" class="m-doc-footer">
    <p v-if="footer?.message" class="m-doc-footer-message">{{ footer.message }}</p>
    <p v-if="footer?.copyright" class="m-doc-footer-copyright">{{ footer.copyright }}</p>
  </div>
</template>

<style lang="scss" scoped>
.m-doc-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
  border-top: 1px solid var(--vp-c-gutter);
  padding: 32px 24px 0;
  color: var(--vp-c-text-2);
}

.m-doc-footer-message,
.m-doc-footer-copyright {
  display: flex;
  align-items: center;
}
</style>
