<!-- 隐私文章：使用 /private 解锁后的会话密钥在本页解密并渲染正文。 -->

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, shallowRef } from "vue";
import type { Component } from "vue";
import { useData, withBase } from "vitepress";
import { clearCachedKey, decryptPayload, getCachedKey, type EncryptedPayload } from "../../features/private/crypto.ts";
import { usePrivateVault } from "../../features/private/vault.ts";

const props = defineProps<{ src: string }>();

const { site } = useData();
const vault = usePrivateVault();
const content = shallowRef<Component | null>(null);
const error = shallowRef("");

function redirectToUnlock() {
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(withBase(`/private/?redirect=${encodeURIComponent(current)}`));
}

async function loadPayload() {
  const response = await fetch(withBase(props.src), { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as EncryptedPayload;
}

async function open() {
  let payload: EncryptedPayload;
  try {
    payload = await loadPayload();
  } catch {
    error.value = "加密内容加载失败，请稍后刷新页面重试。";
    return;
  }

  let key: CryptoKey | null;
  try {
    key = await getCachedKey(payload);
  } catch {
    error.value = "当前浏览器环境不支持解密，请使用 HTTPS 或 localhost 访问。";
    return;
  }

  if (!key) {
    redirectToUnlock();
    return;
  }

  let data: { title: string; html: string };
  try {
    data = JSON.parse(await decryptPayload(payload, key)) as { title: string; html: string };
  } catch {
    clearCachedKey();
    redirectToUnlock();
    return;
  }

  const parsed = new DOMParser().parseFromString(data.html, "text/html");
  vault.setOutline(
    [...parsed.querySelectorAll("h2[id], h3[id], h4[id]")]
      .map((element) => ({
        id: element.id,
        text: (element.textContent ?? "").replace(/\u200b/g, "").trim(),
        level: Number(element.tagName.slice(1)),
      }))
      .filter((item) => item.id && item.text),
  );

  try {
    const { compilePrivateContent } = await import("../../features/private/render.ts");
    content.value = compilePrivateContent(data.html);
    document.title = `${data.title} | ${site.value.title}`;

    await nextTick();
    window.dispatchEvent(new Event("private-post:rendered"));

    const hash = window.location.hash.slice(1);
    if (hash) {
      document.getElementById(decodeURIComponent(hash))?.scrollIntoView();
    }
  } catch {
    error.value = "正文渲染失败，请检查隐私文章里的 HTML 或 Vue 组件。";
  }
}

onMounted(async () => {
  vault.clearOutline();
  await vault.init();
  if (!vault.visible.value) {
    redirectToUnlock();
    return;
  }
  void open();
});

onUnmounted(() => {
  vault.clearOutline();
});

async function handleContentClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  const button = target?.closest("button.copy") as HTMLButtonElement | null;
  if (!button) return;

  const code = button.parentElement?.querySelector("pre code")?.textContent ?? "";
  try {
    await navigator.clipboard.writeText(code);
    button.classList.add("copied");
    window.setTimeout(() => button.classList.remove("copied"), 1500);
  } catch {
    // 剪贴板不可用时保留原按钮。
  }
}
</script>

<template>
  <div v-if="content" class="private-content" @click="handleContentClick">
    <component :is="content" />
  </div>
  <p v-else class="private-status" role="status">{{ error || "正在解密…" }}</p>
</template>

<style lang="scss" scoped>
.private-content :deep(.private-banner) {
  margin: 0 0 28px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.private-content :deep(.private-banner img) {
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
}

.private-status {
  margin: 24px 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

@media (max-width: 639px) {
  .private-content :deep(.private-banner) {
    margin-bottom: 20px;
    border-radius: 12px;
  }
}
</style>
