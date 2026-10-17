import type { DefaultTheme } from "vitepress";
import { footer } from "./footer.ts";
import { resolveIntegrations } from "./integrations.ts";
import { nav } from "./nav.ts";
import { sidebar } from "./sidebar.ts";
import { docOptions } from "./site.ts";
import { socialLinks } from "./social.ts";

export function buildThemeConfig(env: Record<string, string>): DefaultTheme.Config {
  return {
    nav,
    sidebar,
    socialLinks,
    footer,
    ...docOptions,
    ...resolveIntegrations(env),
  };
}
