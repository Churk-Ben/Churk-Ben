---
title: 文章
---

<script setup>
import { data as posts } from './posts.data.ts'
</script>

# 文章

<ul>
  <li v-for="p in posts" style="margin-bottom: 0.75rem">
    <a :href="p.url">{{ p.frontmatter.title }}</a>
    <span style="color: var(--vp-c-text-3); font-size: 0.85rem; margin-left: 0.5rem">{{ p.frontmatter.date }}</span>
  </li>
</ul>
