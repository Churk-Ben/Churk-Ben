---
layout: home

hero:
  name: "Churk's Blog"
  text: 极光是北极星的情书
  tagline: C / C++ / Python / 算法 / 独立开发
  actions:
    - theme: brand
      text: 阅读博文
      link: /posts/
    - theme: alt
      text: GitHub
      link: https://github.com/Churk-Ben
---

<script setup>
import { data as posts } from '../.vitepress/theme/posts.data.ts'
</script>

## 📝 最近文章

<ul class="post-list">
  <li v-for="p in posts">
    <h3><a :href="p.url">{{ p.frontmatter.title }}</a></h3>
    <div class="meta-info">{{ p.frontmatter.date }}</div>
    <div>
      <span class="post-tag" v-for="t in p.frontmatter.tags">{{ t }}</span>
    </div>
  </li>
</ul>

<div style="text-align: center; margin-top: 2rem;">
  <a href="/posts/">查看全部文章 →</a>
</div>
