<!-- 友链展示：读取友链数据并用 VitePress 的 VPTeamMembers 渲染。 -->

<script setup lang="ts">
import { VPTeamMembers } from "vitepress/theme";
import { friendLinks } from "../../features/links/data.ts";
</script>

<template>
  <VPTeamMembers size="small" :members="friendLinks" />
</template>
