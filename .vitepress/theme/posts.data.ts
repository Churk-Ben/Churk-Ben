import { createContentLoader } from 'vitepress'

export default createContentLoader('/posts/*.md', {
  excerpt: true,
  transform(raw) {
    return raw
      .filter(p => p.url !== '/posts/')
      .sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))
  }
})
