<template>
  <span class="plate-chip" :style="plateStyle(weight, store.unit)">{{ formatWeight(weight) }}</span>
</template>

<script setup lang="ts">
import { formatWeight } from '@/domain/units'
import { useAppStore } from '@/stores/app'
import { plateStyle } from './plateStyle'

defineProps<{ weight: number }>()
const store = useAppStore()
</script>

<style scoped>
.plate-chip {
  display: inline-block;
  min-width: 2.6em;
  padding: 0.3em 0.55em;
  border-radius: 0.5em;
  font-weight: 700;
  text-align: center;
  font-variant-numeric: tabular-nums;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
