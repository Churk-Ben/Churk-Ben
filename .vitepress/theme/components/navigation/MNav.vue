<!-- 导航站容器：渲染最近使用与导航数据中的全部分组。 -->

<script setup lang="ts">
import MNavSection from "./MNavSection.vue";
import { NAV_DATA } from "../../features/navigation/data.ts";
import { useRecentLinks } from "../../composables/useRecentLinks.ts";

const { items, remember } = useRecentLinks();
</script>

<template>
  <MNavSection v-if="items.length" title="最近使用" @nav-click="remember" :items="items" />
  <MNavSection v-for="item in NAV_DATA" :key="item.title" v-bind="item" @nav-click="remember" />
</template>
