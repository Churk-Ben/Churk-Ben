import type { MarkdownOptions } from "vitepress";
import { katex } from "@mdit/plugin-katex";

/** Markdown 配置 */
export const markdown: MarkdownOptions = {
  lineNumbers: true,
  container: {
    tipLabel: "提示",
    warningLabel: "注意",
    dangerLabel: "危险",
    infoLabel: "信息",
    detailsLabel: "详情",
  },
  config(md) {
    md.use(katex, {
      strict: (code: string) => (code === "unicodeTextInMathMode" ? "ignore" : "warn"),
    });
  },
};
