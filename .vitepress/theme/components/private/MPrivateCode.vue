<!-- 关于页的六位隐私密码：空心/灰色/主题色分别代表 1/2/3。 -->

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const digits = computed(() =>
  Array.from({ length: 6 }, (_, index) => {
    const value = Number(props.modelValue[index] ?? 1);
    return value >= 1 && value <= 3 ? value : 1;
  }),
);

function cycle(index: number) {
  const next = [...digits.value];
  next[index] = next[index] === 3 ? 1 : next[index] + 1;
  emit("update:modelValue", next.join(""));
}
</script>

<template>
  <div class="m-private-code" role="group" aria-label="隐私入口密码">
    <button
      v-for="(digit, index) in digits"
      :key="index"
      type="button"
      class="m-private-code-dot"
      :class="`is-${digit}`"
      :aria-label="`第 ${index + 1} 位：${digit}，点击切换`"
      @click="cycle(index)"
    />
  </div>
</template>

<style lang="scss" scoped>
.m-private-code {
  display: flex;
  gap: 4px;
}

.m-private-code-dot {
  width: 12px;
  height: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 50%;
  padding: 0;
  background: transparent;
  cursor: default;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.m-private-code-dot:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.m-private-code-dot.is-2 {
  border-color: transparent;
  background: var(--vp-c-text-3);
}

.m-private-code-dot.is-3 {
  border-color: transparent;
  background: var(--vp-c-brand-1);
}
</style>
