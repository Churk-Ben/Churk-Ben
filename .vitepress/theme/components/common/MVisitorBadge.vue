<!-- 访问统计徽章：按主题配置的 badgeId 渲染品牌色访问数图片，开发环境不请求，加载失败时隐藏。 -->

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useData } from "vitepress";

const props = defineProps<{ pageId?: string }>();
const { theme } = useData();
const failed = ref(false);
const isDevelopment = import.meta.env.DEV;
const badgeId = computed(() => {
  const id = theme.value.visitor?.badgeId;
  return id && props.pageId ? `${id}.${props.pageId}` : id;
});
const badgeSrc = computed(() => {
  if (!badgeId.value) return "";
  const params = new URLSearchParams({
    page_id: badgeId.value,
    left_text: "views",
    left_color: "#b47967",
    right_color: "#7e4938",
  });
  return `https://visitor-badge.laobi.icu/badge?${params}`;
});

watch(badgeId, () => {
  failed.value = false;
});
</script>

<template>
  <img
    v-if="!isDevelopment && badgeId && !failed"
    class="visitor"
    :src="badgeSrc"
    :alt="pageId ? '当前页面累计访问数' : '站点累计访问数'"
    :title="pageId ? '当前页面累计访问数' : '站点累计访问数'"
    @error="failed = true"
  />
</template>

<style lang="scss" scoped>
.visitor {
  height: 18px;
  width: auto;
  border-radius: 4px;
  vertical-align: middle;
}
</style>
