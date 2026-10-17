<!-- 导航卡片：渲染单个外链站点的图标、标题、徽章与描述，点击时触发 nav-click。 -->

<script setup lang="ts">
import { computed, ref } from "vue";
import { withBase } from "vitepress";

import type { NavLink } from "../../features/navigation/types.ts";

const props = defineProps<{
  noIcon?: NavLink["noIcon"];
  icon?: NavLink["icon"];
  badge?: NavLink["badge"];
  title: NavLink["title"];
  desc?: NavLink["desc"];
  link: NavLink["link"];
}>();

const emits = defineEmits<{
  (event: "nav-click", data: NavLink): void;
}>();

const svg = computed(() => {
  if (typeof props.icon === "object") return props.icon.svg;
  return "";
});

const formatBadge = computed(() => {
  if (typeof props.badge === "string") {
    return { text: props.badge, type: "info" as const };
  }
  return props.badge;
});

const handleClick = () => emits("nav-click", props);
const iconFailed = ref(false);
</script>

<template>
  <a v-if="link" class="m-nav-link" :href="link" target="_blank" rel="noreferrer" @click="handleClick">
    <article class="box" :class="{ 'has-badge': formatBadge }">
      <div class="box-header">
        <template v-if="!noIcon">
          <div v-if="svg" class="icon" aria-hidden="true" v-html="svg"></div>
          <div v-else class="icon" aria-hidden="true">
            <img
              v-if="icon && typeof icon === 'string' && !iconFailed"
              :src="withBase(icon)"
              alt=""
              loading="lazy"
              @error="iconFailed = true"
            />
            <span v-else class="icon-fallback">{{ title?.charAt(0).toUpperCase() }}</span>
          </div>
        </template>
        <h5 class="title" :class="{ 'no-icon': noIcon }">
          {{ title }}
        </h5>
      </div>
      <Badge v-if="formatBadge" class="badge" :type="formatBadge.type" :text="formatBadge.text" />
      <p v-if="desc" class="desc">{{ desc }}</p>
    </article>
  </a>
</template>

<style lang="scss" scoped>
.m-nav-link {
  --m-nav-icon-box-size: 40px;
  --m-nav-icon-size: 24px;
  --m-nav-box-gap: 12px;

  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 8px;
  height: 100%;
  text-decoration: inherit;
  background-color: var(--vp-c-bg-alt);
  transition:
    border-color 0.2s,
    background-color 0.2s;
  &:hover {
    border-color: var(--vp-c-brand-1);
    text-decoration: initial;
    background-color: var(--vp-c-bg);
  }

  .box {
    display: flex;
    flex-direction: column;
    position: relative;
    padding: var(--m-nav-box-gap);
    height: 100%;
    color: var(--vp-c-text-1);
    &.has-badge {
      padding-top: calc(var(--m-nav-box-gap) + 2px);
    }
    &-header {
      display: flex;
      align-items: center;
    }
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    margin-right: calc(var(--m-nav-box-gap) - 2px);
    border-radius: 6px;
    width: var(--m-nav-icon-box-size);
    height: var(--m-nav-icon-box-size);
    font-size: var(--m-nav-icon-size);
    background-color: var(--vp-c-default-soft);
    transition: background-color 0.25s;
    :deep(svg) {
      width: var(--m-nav-icon-size);
      fill: currentColor;
    }
    :deep(img) {
      border-radius: 4px;
      width: var(--m-nav-icon-size);
    }
  }

  .icon-fallback {
    color: var(--vp-c-text-2);
    font-size: 16px;
    font-weight: 600;
  }

  .title {
    overflow: hidden;
    flex-grow: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: 600;
    &:not(.no-icon) {
      line-height: var(--m-nav-icon-box-size);
    }
  }

  .badge {
    position: absolute;
    top: 2px;
    right: 0;
    transform: scale(0.8);
  }

  .desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
    margin: calc(var(--m-nav-box-gap) - 2px) 0 0;
    line-height: 1.5;
    font-size: 12px;
    color: var(--vp-c-text-2);
  }
}

@media (max-width: 960px) {
  .m-nav-link {
    --m-nav-icon-box-size: 36px;
    --m-nav-icon-size: 20px;
    --m-nav-box-gap: 8px;

    .title {
      font-size: 14px;
    }
  }
}
</style>
