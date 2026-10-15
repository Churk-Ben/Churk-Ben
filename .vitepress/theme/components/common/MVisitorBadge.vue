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

watch(badgeId, () => {
  failed.value = false;
});
</script>

<template>
  <img
    v-if="!isDevelopment && badgeId && !failed"
    class="visitor"
    :src="`https://visitor-badge.laobi.icu/badge?page_id=${encodeURIComponent(badgeId)}`"
    :alt="pageId ? '当前页面累计访问数' : '站点累计访问数'"
    :title="pageId ? '当前页面累计访问数' : '站点累计访问数'"
    @error="failed = true"
  />
</template>
