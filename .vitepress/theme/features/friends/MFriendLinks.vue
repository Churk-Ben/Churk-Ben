<script setup lang="ts">
import { VPTeamMembers } from "vitepress/theme";
import { friends } from "./data";
</script>

<template>
  <VPTeamMembers size="small" :members="friends" />
</template>
