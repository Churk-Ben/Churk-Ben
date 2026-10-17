<!-- 文档页脚：在带侧栏的文档页显示访客徽章、页脚公告与版权。 -->

<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { useLayout } from "vitepress/theme";

import { usePageId } from "../../composables/usePageId";
import MVisitorBadge from "../common/MVisitorBadge.vue";

const { theme } = useData();
const footer = computed(() => theme.value.footer);
const visitor = computed(() => theme.value.visitor);

const { hasSidebar } = useLayout();
const pageId = usePageId();

const isDocFooterVisible = computed(() => {
  return hasSidebar.value && Boolean(footer.value?.message || footer.value?.copyright || visitor.value?.badgeId);
});
</script>

<template>
  <div v-if="isDocFooterVisible" class="m-doc-footer">
    <div class="m-doc-footer-message">
      <MVisitorBadge :page-id="pageId" />
      <p v-if="footer?.message">{{ footer.message }}</p>
    </div>
    <p class="m-doc-footer-copyright" v-if="footer?.copyright">
      {{ footer.copyright }}
    </p>
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

.visitor {
  margin-right: 8px;
}

@media (max-width: 414px) {
  .visitor {
    display: none;
  }
}
</style>
