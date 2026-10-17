<!-- 站点布局：继承默认 Layout，接入外观切换、图片放大与导航/侧栏/文档区的主题组件及扩展插槽。 -->

<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from "@nolebase/vitepress-plugin-enhanced-readabilities/client";
import { useAppearance } from "../../composables/useAppearance";
import { useMediumZoom } from "../../composables/useMediumZoom";
import MVisitorBadge from "../common/MVisitorBadge.vue";
import MSidebarWidgets from "../sidebar/MSidebarWidgets.vue";
import MDocFooter from "./MDocFooter.vue";
import MComments from "./MComments.vue";

const { Layout } = DefaultTheme;
useAppearance();
useMediumZoom();
</script>

<template>
  <Layout v-bind="$attrs">
    <template #nav-bar-content-after>
      <NolebaseEnhancedReadabilitiesMenu />
    </template>
    <template #nav-screen-content-after>
      <NolebaseEnhancedReadabilitiesScreenMenu />
    </template>
    <template #nav-bar-title-after>
      <MVisitorBadge class="nav-visitor" />
    </template>
    <template #sidebar-nav-before>
      <!-- 侧栏顶部扩展区：搜索、公告等 -->
      <MSidebarWidgets>
        <!-- <MYourWidget /> -->
      </MSidebarWidgets>
    </template>
    <template #sidebar-nav-after>
      <!-- 侧栏底部扩展区：个人卡片、音乐播放器等 -->
      <MSidebarWidgets>
        <!-- <MProfileCard /> -->
        <!-- <MMusicPlayer /> -->
      </MSidebarWidgets>
    </template>
    <template #doc-footer-before>
      <MComments />
    </template>
    <template #doc-after>
      <MDocFooter />
    </template>
  </Layout>
</template>

<style lang="scss" scoped>
.nav-visitor {
  margin-left: 8px;
}

@media (min-width: 768px) and (max-width: 920px) {
  .nav-visitor {
    display: none;
  }
}
</style>
