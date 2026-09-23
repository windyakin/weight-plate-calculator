<template>
  <div class="weight-input">
    <ion-button fill="outline" :disabled="prev < min" aria-label="減らす" @click="model = prev">
      <ion-icon slot="icon-only" :icon="remove" />
    </ion-button>
    <ion-input
      class="value"
      type="number"
      inputmode="decimal"
      :aria-label="label"
      :value="fromInternal(model)"
      @ion-change="onInput"
    >
      <span slot="end" class="suffix">{{ store.unit }}</span>
    </ion-input>
    <ion-button fill="outline" aria-label="増やす" @click="model = next">
      <ion-icon slot="icon-only" :icon="add" />
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonInput } from '@ionic/vue'
import { add, remove } from 'ionicons/icons'
import { computed } from 'vue'
import { fromInternal, toInternal } from '@/domain/units'
import { useAppStore } from '@/stores/app'

const props = withDefaults(defineProps<{ step: number; min?: number; label?: string }>(), {
  min: 0,
  label: '重量',
})
const model = defineModel<number>({ required: true })
const store = useAppStore()

// 刻みの倍数からずれているときは、まず近い倍数に揃える（62.5 で +5 なら 65）
const prev = computed(() => Math.ceil(model.value / props.step) * props.step - props.step)
const next = computed(() => Math.floor(model.value / props.step) * props.step + props.step)

const onInput = (event: CustomEvent<{ value?: string | number | null }>) => {
  const value = Number(event.detail.value)
  if (Number.isFinite(value) && value >= fromInternal(props.min)) model.value = toInternal(value)
}
</script>

<style scoped>
.weight-input {
  display: flex;
  align-items: center;
  gap: 6px;
}
.value {
  flex: 1;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  --padding-start: 8px;
  --padding-end: 8px;
}
.suffix {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}
</style>
