<script setup lang="ts">
import { VPTeamMembers } from "vitepress/theme";
import { friends } from "../../features/friends/data.ts";
</script>

<template>
  <VPTeamMembers size="small" :members="friends" />
</template>
