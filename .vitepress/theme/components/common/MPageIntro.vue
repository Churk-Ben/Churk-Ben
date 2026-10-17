<!-- 页面引言：渲染页面顶部的一段说明文字，内容由默认插槽传入。 -->

<template>
  <p class="page-intro"><slot /></p>
</template>

<style lang="scss" scoped>
p.page-intro {
  margin: 16px 0 28px;
  color: var(--vp-c-text-2);
}
</style>
