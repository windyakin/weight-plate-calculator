<template>
  <div class="diff">
    <p v-if="transition.cost === 0" class="same">付け替えなし</p>
    <template v-else>
      <div v-if="transition.remove.length" class="row">
        <span class="label remove">外す</span>
        <span class="chips"><PlateChip v-for="(w, i) in transition.remove" :key="i" :weight="w" /></span>
      </div>
      <div v-if="transition.add.length" class="row">
        <span class="label add">付ける</span>
        <span class="chips"><PlateChip v-for="(w, i) in transition.add" :key="i" :weight="w" /></span>
      </div>
      <p class="note">片側あたり。外すのは外側から、付けるのは内側から</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Transition } from '@/domain/diff'
import PlateChip from './PlateChip.vue'

defineProps<{ transition: Transition }>()
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
}
.label {
  flex: none;
  width: 3.5em;
  font-weight: 700;
}
.remove {
  color: var(--ion-color-danger);
}
.add {
  color: var(--ion-color-success);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.same {
  margin: 6px 0;
  color: var(--ion-color-success);
  font-weight: 700;
}
.note {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--ion-color-medium);
}
</style>
