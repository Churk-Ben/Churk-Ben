<!-- 关于页内容：个人简介、技术栈与联系方式，右下角是星野的装饰头像。 -->

<script setup lang="ts">
import { ref } from "vue";

const email = "churkben0@gmail.com";
const copied = ref(false);
const shaking = ref(false);

const stack = [
  { name: "C++", src: "https://img.shields.io/badge/-C++-00599C?style=flat-square&logo=c%2B%2B&logoColor=white" },
  { name: "Python", src: "https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white" },
  {
    name: "JavaScript",
    src: "https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black",
  },
  {
    name: "TypeScript",
    src: "https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white",
  },
  { name: "Vue", src: "https://img.shields.io/badge/-Vue.js-4FC08D?style=flat-square&logo=vue.js&logoColor=white" },
  { name: "Qt", src: "https://img.shields.io/badge/-Qt-41CD52?style=flat-square&logo=qt&logoColor=white" },
  { name: "Java", src: "https://img.shields.io/badge/-Java-007396?style=flat-square&logo=java&logoColor=white" },
];

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 1600);
  } catch {
    // 剪贴板不可用时保留 mailto 链接即可。
  }
}

function shake() {
  if (shaking.value) return;
  shaking.value = true;
  window.setTimeout(() => (shaking.value = false), 600);
}
</script>

<template>
  <div class="about">
    <header class="about-hero">
      <p class="about-eyebrow">About</p>
      <h2>👋 Hello! world~</h2>
      <p class="about-tagline"><em>Aurore est le billet-doux de Polaris.</em></p>
      <p class="about-meta">🔭 独立开发者 · 🏠 Nanjing · 🏢 <a href="https://github.com/JuFireX">JuFire Studio</a></p>
      <div class="about-links">
        <a class="about-pill" href="https://www.churk.top">Blog</a>
        <a class="about-pill" href="https://github.com/Churk-Ben">GitHub</a>
      </div>
      <div class="about-sticker" :class="{ 'is-shaking': shaking }" @dblclick="shake">
        <img class="about-sticker-img" src="/shared/icon.png" alt="星野日向" width="144" height="144" loading="lazy" />
      </div>
    </header>

    <section class="about-section">
      <h2>🛠 Tech Stack</h2>
      <div class="about-stack">
        <img v-for="item in stack" :key="item.name" :src="item.src" :alt="item.name" loading="lazy" />
      </div>
    </section>

    <section class="about-section">
      <h2>📫 Contact</h2>
      <ul class="about-contact">
        <li>
          <span class="about-contact-label">Blog</span>
          <a href="https://www.churk.top">www.churk.top</a>
        </li>
        <li>
          <span class="about-contact-label">GitHub</span>
          <a href="https://github.com/Churk-Ben">@Churk-Ben</a>
        </li>
        <li>
          <span class="about-contact-label">Email</span>
          <a :href="`mailto:${email}`">{{ email }}</a>
          <button type="button" class="about-copy" @click="copyEmail">{{ copied ? "已复制" : "复制" }}</button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.about-hero {
  position: relative;
  margin: 8px 0 40px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 28px 32px;
  background: radial-gradient(circle at 85% 100%, var(--vp-c-brand-soft), transparent 55%), var(--vp-c-bg-soft);
  overflow: hidden;
}

.about-eyebrow {
  margin: 0 0 8px;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.about-hero h2 {
  margin: 0;
}

.about-tagline {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
}

.about-meta {
  margin: 16px 0 0;
  color: var(--vp-c-text-2);
}

.about-meta a {
  color: var(--vp-c-brand-1);
}

.about-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.about-pill {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 4px 14px;
  color: var(--vp-c-text-1);
  font-size: 13px;
  text-decoration: none;
  background-color: var(--vp-c-bg);
  transition:
    border-color 0.2s,
    color 0.2s;
}

.about-pill:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.about-section {
  margin-top: 36px;
}

.about-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.about-stack img {
  display: block;
}

.about-contact {
  margin: 0;
  padding: 0;
  list-style: none;
}

.about-contact li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 10px 0;
}

.about-contact li + li {
  border-top: 1px solid var(--vp-c-divider);
}

.about-contact-label {
  min-width: 64px;
  color: var(--vp-c-text-2);
}

.about-copy {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 1px 10px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.about-copy:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.about-sticker {
  position: relative;
  width: 128px;
  margin: 24px 0 0 auto;
  isolation: isolate;
}

.about-sticker::before {
  content: "";
  position: absolute;
  inset: -14%;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(circle, var(--vp-c-brand-soft), transparent 70%);
}

.about-sticker img {
  display: block;
  width: 100%;
  height: auto;
}

.about-sticker.is-shaking {
  animation: about-shake 0.6s ease-in-out;
}

@keyframes about-shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(-7deg);
  }
  30% {
    transform: rotate(6deg);
  }
  45% {
    transform: rotate(-4deg);
  }
  60% {
    transform: rotate(3deg);
  }
  75% {
    transform: rotate(-2deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-sticker.is-shaking {
    animation: none;
  }
}

@media (min-width: 640px) {
  .about-hero {
    padding-right: 208px;
  }

  .about-sticker {
    position: absolute;
    right: 20px;
    bottom: -20px;
    z-index: 1;
    width: 176px;
    margin: 0;
  }
}
</style>
