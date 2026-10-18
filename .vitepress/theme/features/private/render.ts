import { compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import type { Component } from "vue";

type RenderFunction = (ctx: unknown, cache: unknown[]) => unknown;

/**
 * 把解密后的 HTML 当作 Vue 模板编译，让隐私文章里的全局组件
 * （MAbout、MPageIntro 等）和普通 Markdown 一样工作。
 */
export function compilePrivateContent(html: string): Component {
  const { code } = compile(html, { mode: "function" });
  const factory = new Function("Vue", code) as (runtime: typeof Vue) => RenderFunction;
  return { name: "PrivateContent", render: factory(Vue) } as Component;
}
