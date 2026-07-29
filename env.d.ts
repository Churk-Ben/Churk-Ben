/// <reference types="vitepress/client" />

import { DefaultTheme } from 'vitepress'

declare module 'vitepress' {
  export namespace DefaultTheme {
    export interface Config {
      visitor?: {
        badgeId: string
      }

      comment?: {
        repo: `${string}/${string}`
        repoId: string
        category: string
        categoryId: string
      }
    }
  }
}
