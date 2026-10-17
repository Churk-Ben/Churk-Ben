<!-- 侧栏扩展容器：为个人卡片、音乐播放器等预留纵向空间，为空时自动隐藏。 -->

<template>
  <div class="m-sidebar-widgets">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.m-sidebar-widgets {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 预留较高空间，方便放置个人卡片、音乐播放器等 */
  min-height: 200px;
}

.m-sidebar-widgets:empty {
  display: none;
}

.m-sidebar-widgets:not(:empty) {
  margin-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 20px;
}
</style>
