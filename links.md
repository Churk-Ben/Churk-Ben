<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

# Our Team

Say hello to our awesome team.

<VPTeamMembers size="small" :members />

# 友链

## 茂茂物语

[notes.fe-mm.com](https://notes.fe-mm.com)

---

想交换友链？欢迎[邮件联系](mailto:churkben0@gmail.com)或提 GitHub Issue。
