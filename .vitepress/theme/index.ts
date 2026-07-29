import type { EnhanceAppContext, Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { createMediumZoomProvider } from './composables/useMediumZoom'
import { InjectionKey } from '@nolebase/vitepress-plugin-enhanced-readabilities/client'
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'

import MLayout from './components/MLayout.vue'
import MNavLinks from './components/MNavLinks.vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: MLayout,
  enhanceApp({ app, router }: EnhanceAppContext) {
    createMediumZoomProvider(app, router)

    app.component('MNavLinks', MNavLinks)
    // 关闭布局切换动画

    // app.provide(InjectionKey, {
    //   layoutSwitch: {
    //     disableAnimation: true,
    //   },
    // })
    //
    app.provide('DEV', process.env.NODE_ENV === 'development')
  },
} satisfies Theme
