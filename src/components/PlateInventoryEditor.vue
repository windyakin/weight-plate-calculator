<template>
  <ion-segment :value="store.inputMode" @ion-change="store.inputMode = $event.detail.value as InputMode">
    <ion-segment-button value="total"><ion-label>総枚数で入力</ion-label></ion-segment-button>
    <ion-segment-button value="pairs"><ion-label>ペア数で入力</ion-label></ion-segment-button>
  </ion-segment>

  <ion-list>
    <ion-item v-for="(plate, i) in store.plates" :key="plate.weight">
      <PlateChip slot="start" :weight="plate.weight" />
      <ion-label>
        <h3>{{ formatWeight(plate.weight) }}{{ store.unit }}</h3>
        <p>
          片側 {{ plate.pairs }} 枚まで
          <ion-text v-if="store.inputMode === 'total' && totals[i] % 2 === 1" color="warning">（1 枚余ります）</ion-text>
        </p>
      </ion-label>
      <div slot="end" class="counter">
        <ion-button fill="clear" :disabled="countOf(i) === 0" aria-label="減らす" @click="setCount(i, countOf(i) - 1)">
          <ion-icon slot="icon-only" :icon="removeCircleOutline" />
        </ion-button>
        <span class="count">{{ countOf(i) }}</span>
        <ion-button fill="clear" aria-label="増やす" @click="setCount(i, countOf(i) + 1)">
          <ion-icon slot="icon-only" :icon="addCircleOutline" />
        </ion-button>
        <ion-button fill="clear" color="danger" aria-label="削除" @click="removePlate(i)">
          <ion-icon slot="icon-only" :icon="trashOutline" />
        </ion-button>
      </div>
    </ion-item>
  </ion-list>

  <div class="add-row">
    <ion-input
      v-model="newWeight"
      type="number"
      inputmode="decimal"
      fill="outline"
      :label="`追加するプレート（${store.unit}）`"
      label-placement="stacked"
    />
    <ion-button :disabled="!canAdd" @click="addPlate">追加</ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSegment, IonSegmentButton, IonText } from '@ionic/vue'
import { addCircleOutline, removeCircleOutline, trashOutline } from 'ionicons/icons'
import { computed, ref } from 'vue'
import { formatWeight, toInternal } from '@/domain/units'
import { useAppStore, type InputMode } from '@/stores/app'
import PlateChip from './PlateChip.vue'

const store = useAppStore()

const totals = computed(() => store.plates.map((p) => p.pairs * 2 + (p.odd ? 1 : 0)))

const countOf = (i: number) => (store.inputMode === 'total' ? totals.value[i] : store.plates[i].pairs)

const setCount = (i: number, count: number) => {
  const next =
    store.inputMode === 'total' ? { pairs: Math.floor(count / 2), odd: count % 2 === 1 } : { pairs: count, odd: false }
  store.setPlates(store.plates.map((p, k) => (k === i ? { ...p, ...next } : p)))
}

const removePlate = (i: number) => store.setPlates(store.plates.filter((_, k) => k !== i))

const newWeight = ref<string | number>('')
const newWeightInternal = computed(() => toInternal(Number(newWeight.value)))
const canAdd = computed(
  () => newWeightInternal.value > 0 && !store.plates.some((p) => p.weight === newWeightInternal.value),
)

const addPlate = () => {
  if (!canAdd.value) return
  store.setPlates([...store.plates, { weight: newWeightInternal.value, pairs: 1 }])
  newWeight.value = ''
}
</script>

<style scoped>
.counter {
  display: flex;
  align-items: center;
}
.count {
  min-width: 2em;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.add-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 16px 16px;
}
ion-segment {
  margin: 8px 16px;
  width: auto;
}
</style>
