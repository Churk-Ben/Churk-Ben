import { createContentLoader } from 'vitepress'

export interface Post {
  url: string
  title: string
  date: string
  tags: string[]
}

export declare const data: Post[]

export default createContentLoader<Post[]>('/posts/*.md', {
  transform(raw) {
    return raw
      .filter(post => post.frontmatter.date)
      .map(({ url, frontmatter }) => ({
        url,
        title: frontmatter.title,
        date: new Date(frontmatter.date).toISOString().slice(0, 10),
        tags: [...new Set<string>(frontmatter.tags ?? [])],
      }))
      .sort((a, b) => b.date.localeCompare(a.date) || a.url.localeCompare(b.url))
  },
})
