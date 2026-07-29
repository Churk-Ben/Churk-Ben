import { defineConfig } from 'vitepress'
import { katex } from '@mdit/plugin-katex'

export default defineConfig({
  title: "Churk's Blog",
  description: '极光是北极星的情书',
  lang: 'zh-CN',
  srcDir: 'docs',

  head: [
    ['link', { rel: 'icon', href: '/img/icon120.png' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css' }],
    ['meta', { name: 'theme-color', content: '#3c6e71' }],
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '博文', link: '/posts/' },
      { text: '关于', link: '/about' },
      { text: '友链', link: '/links' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Churk-Ben' },
    ],

    footer: {
      message: '萌ICP备20250835号',
      copyright: 'Copyright © 2024-present Churk Ben',
    },

    darkModeSwitchLabel: '主题切换',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    lastUpdated: { text: '最后更新' },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    outline: {
      label: '本页目录',
    },
  },

  markdown: {
    lineNumbers: true,
    config: (md) => {
      md.use(katex)
    },
  },
})
