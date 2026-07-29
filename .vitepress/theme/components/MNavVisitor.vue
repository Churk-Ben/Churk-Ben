<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, inject } from 'vue'

const DEV = inject<boolean>('DEV', false)
const { theme } = useData()
const visitor = computed(() => theme.value.visitor)
</script>

<template>
  <img
    v-if="!DEV && visitor?.badgeId"
    class="visitor"
    :src="`https://visitor-badge.laobi.icu/badge?page_id=${visitor.badgeId}`"
    onerror="this.style.display = 'none'"
  />
</template>

<style scoped>
.visitor {
  margin-left: 8px;
}
@media (min-width: 768px) and (max-width: 920px) {
  .visitor {
    display: none;
  }
}
</style>
