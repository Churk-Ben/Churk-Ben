<!-- 侧栏扩展容器：承载侧栏挂件，为空时自动隐藏。 -->

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
}

.m-sidebar-widgets:empty {
  display: none;
}
</style>
