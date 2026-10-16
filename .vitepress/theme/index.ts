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
  MHomeContent: defineAsyncComponent(() => import("./components/posts/MHomeContent.vue")),
  MPostArchive: defineAsyncComponent(() => import("./components/posts/MPostArchive.vue")),
  MNav: defineAsyncComponent(() => import("./components/navigation/MNav.vue")),
  MFriendLinks: defineAsyncComponent(() => import("./components/friends/MFriendLinks.vue")),
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
