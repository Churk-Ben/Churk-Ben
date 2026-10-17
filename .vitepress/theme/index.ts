import type { EnhanceAppContext, Theme } from "vitepress";
import { defineAsyncComponent } from "vue";
import DefaultTheme from "vitepress/theme";
import "@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css";
import "katex/dist/katex.min.css";

import MLayout from "./components/layout/MLayout.vue";
import MPageIntro from "./components/common/MPageIntro.vue";
import "./custom.scss";

const components = {
  MPageIntro,
  MAbout: defineAsyncComponent(() => import("./components/about/MAbout.vue")),
  MHomeContent: defineAsyncComponent(() => import("./components/home/MHomeContent.vue")),
  MPostArchive: defineAsyncComponent(() => import("./components/posts/MPostArchive.vue")),
  MNav: defineAsyncComponent(() => import("./components/nav/MNav.vue")),
  MLinks: defineAsyncComponent(() => import("./components/links/MLinks.vue")),
};

export default {
  extends: DefaultTheme,
  Layout: MLayout,
  enhanceApp({ app }: EnhanceAppContext) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component);
    }
  },
} satisfies Theme;
