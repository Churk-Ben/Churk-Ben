<!-- 隐私侧栏：默认隐藏，关于页密码验证通过后显示，可展开查看隐私文章。 -->

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { withBase } from "vitepress";
import { usePageId } from "../../composables/usePageId";
import { usePrivateVault } from "../../features/private/vault.ts";

const vault = usePrivateVault();
const pageId = usePageId();
const open = ref(false);

const current = computed(() => pageId.value.replace(/\/$/, ""));
const isArchive = computed(() => current.value === "/private");
const isInPrivate = computed(() => current.value === "/private" || current.value.startsWith("/private/"));

watch(
  isInPrivate,
  (value) => {
    if (value) open.value = true;
  },
  { immediate: true },
);

function isActive(url: string) {
  return current.value === url.replace(/\/$/, "");
}

onMounted(() => {
  void vault.init();
});
</script>

<template>
  <section v-if="vault.visible.value" class="m-private-sidebar" aria-label="隐私文章">
    <div class="item">
      <a
        class="link"
        :class="{ 'is-active': isArchive }"
        :href="withBase('/private/')"
        :aria-current="isArchive ? 'page' : undefined"
      >
        <span class="text">隐私</span>
      </a>
      <button
        type="button"
        class="caret"
        :aria-label="open ? '收起隐私文章' : '展开隐私文章'"
        :aria-expanded="open"
        @click="open = !open"
      >
        <span class="vpi-chevron-right caret-icon" :class="{ 'is-open': open }" />
      </button>
    </div>

    <ul v-if="open" class="items">
      <li v-for="post in vault.posts.value" :key="post.url">
        <a
          class="link post-link"
          :class="{ 'is-active': isActive(post.url) }"
          :href="withBase(post.url)"
          :aria-current="isActive(post.url) ? 'page' : undefined"
        >
          <span class="text">{{ post.title }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.m-private-sidebar {
  margin-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 10px;
  padding-bottom: 1.5rem;
}

.item {
  display: flex;
  align-items: center;
  width: 100%;
}

.link {
  display: flex;
  align-items: center;
  flex-grow: 1;
  text-decoration: none;
}

.text {
  flex-grow: 1;
  padding: 0.25rem 0;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.7142857;
  transition: color 0.25s;
}

.link.is-active .text,
.link:hover .text {
  color: var(--vp-c-brand-1);
}

.caret {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  margin-right: -0.4375rem;
  width: 2rem;
  height: 2rem;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: color 0.25s;
}

.caret:hover {
  color: var(--vp-c-text-1);
}

.caret-icon {
  font-size: 1.125rem;
  transform: rotate(0);
  transition: transform 0.25s;
}

.caret-icon.is-open {
  transform: rotate(90deg);
}

.items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.post-link .text {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.7142857;
}

.post-link.is-active .text,
.post-link:hover .text {
  color: var(--vp-c-brand-1);
}
</style>
