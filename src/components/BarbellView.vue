<template>
  <div class="barbell" role="img" :aria-label="label">
    <div class="sleeve-end" />
    <div class="collar" />
    <div
      v-for="(weight, i) in stack"
      :key="i"
      class="plate"
      :style="{ ...plateStyle(weight, store.unit), height: `${heightOf(weight)}%`, width: `${widthOf(weight)}px` }"
    >
      <span>{{ formatWeight(weight) }}</span>
    </div>
    <div class="sleeve" />
  </div>
  <p class="caption">片側（左が内側）</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Stack } from '@/domain/types'
import { formatWeight } from '@/domain/units'
import { useAppStore } from '@/stores/app'
import { plateStyle } from './plateStyle'

const props = defineProps<{ stack: Stack }>()
const store = useAppStore()

const maxPlate = computed(() => Math.max(...store.plates.map((p) => p.weight), 1))

const heightOf = (weight: number) => 35 + 65 * Math.sqrt(weight / maxPlate.value)
const widthOf = (weight: number) => Math.round(16 + 18 * Math.sqrt(weight / maxPlate.value))

const label = computed(() =>
  props.stack.length ? `片側: ${props.stack.map(formatWeight).join(', ')}` : '片側: プレートなし',
)
</script>

<style scoped>
.barbell {
  display: flex;
  align-items: center;
  height: 140px;
  padding: 0 4px;
  overflow-x: auto;
}
.sleeve-end {
  width: 12px;
  height: 14px;
  background: var(--bar-color);
  border-radius: 2px 0 0 2px;
  flex: none;
}
.collar {
  width: 10px;
  height: 36px;
  background: var(--bar-color);
  border-radius: 2px;
  margin-right: 2px;
  flex: none;
}
.plate {
  flex: none;
  margin-right: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.25);
  font-size: 0.7rem;
  font-weight: 700;
}
.plate span {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.sleeve {
  flex: 1 0 24px;
  height: 14px;
  background: var(--bar-color);
  border-radius: 0 2px 2px 0;
}
.caption {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  text-align: center;
}
</style>
