import { h } from 'vue'
import { useData, EnhanceAppContext } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { createMediumZoomProvider } from './composables/useMediumZoom'
import MLayout from './components/MLayout.vue'
import MNavLinks from './components/MNavLinks.vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    const props: Record<string, any> = {}
    const { frontmatter } = useData()

    if (frontmatter.value?.layoutClass) {
      props.class = frontmatter.value.layoutClass
    }

    return h(MLayout, props)
  },
  enhanceApp({ app, router }: EnhanceAppContext) {
    createMediumZoomProvider(app, router)

    app.component('MNavLinks', MNavLinks)

    app.provide('DEV', process.env.NODE_ENV === 'development')
  },
}
