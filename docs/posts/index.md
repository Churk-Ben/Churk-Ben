---
title: 博文列表
---

<script setup>
import { data as posts } from '../../.vitepress/theme/posts.data.ts'
</script>

# 📝 全部博文

<ul class="post-list">
  <li v-for="p in posts">
    <h3><a :href="p.url">{{ p.frontmatter.title }}</a></h3>
    <div class="meta-info">{{ p.frontmatter.date }}</div>
    <div>
      <span class="post-tag" v-for="t in p.frontmatter.tags">{{ t }}</span>
    </div>
  </li>
</ul>
