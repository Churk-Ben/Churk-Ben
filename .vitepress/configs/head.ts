import type { HeadConfig } from "vitepress";

export const head: HeadConfig[] = [
  ["meta", { name: "theme-color", content: "#ffffff" }],
  ["link", { rel: "icon", href: "/img/icon.png" }],
  [
    "link",
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
    },
  ],
];
