<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from "@nolebase/vitepress-plugin-enhanced-readabilities/client";
import { useAppearance } from "../../composables/useAppearance";
import { useMediumZoom } from "../../composables/useMediumZoom";
import MVisitorBadge from "../common/MVisitorBadge.vue";
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
    <template #doc-footer-before>
      <MComments />
    </template>
    <template #doc-after>
      <MDocFooter />
    </template>
  </Layout>
</template>

<style scoped>
.nav-visitor {
  margin-left: 8px;
}

@media (min-width: 768px) and (max-width: 920px) {
  .nav-visitor {
    display: none;
  }
}
</style>
