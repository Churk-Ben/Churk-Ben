<script setup lang="ts">
import MNavLinks from "./MNavLinks.vue";
import { NAV_DATA } from "./data";
import { useRecentLinks } from "./useRecentLinks";

const { items, remember } = useRecentLinks();
</script>

<template>
  <MNavLinks v-if="items.length" title="最近使用" @nav-click="remember" :items="items" />
  <MNavLinks v-for="item in NAV_DATA" :key="item.title" v-bind="item" @nav-click="remember" />
</template>
