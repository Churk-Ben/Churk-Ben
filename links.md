---
title: 友链
order: 3
---

# 友链

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
