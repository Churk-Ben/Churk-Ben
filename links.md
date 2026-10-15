---
title: 友链
order: 3
sidebar: false
aside: false
prev: false
next: false
---

# 友链

<p class="page-intro">一些朋友，一些值得常去的小站。</p>

<script setup>
import { VPTeamMembers } from 'vitepress/theme'
import { linkSvg, githubSvg } from './.vitepress/theme/icons'

const members = [
  {
    avatar: '/assets/avatars/erhjiu.jpg',
    name: 'Erhjiu',
    links: [
      { icon: { svg: linkSvg }, link: 'https://erhjiu.com' },
      { icon: { svg: githubSvg }, link: 'https://github.com/erhjiu' },
    ]
  },
  {
    avatar: 'https://notes.fe-mm.com/logo.png',
    name: '茂茂物语',
    links: [
      { icon: { svg: linkSvg }, link: 'https://notes.fe-mm.com' }
    ]
  },
]
</script>

<VPTeamMembers size="small" :members="members" />
