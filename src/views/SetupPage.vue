<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>設定</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list-header><ion-label>単位</ion-label></ion-list-header>
      <ion-segment :value="store.unit" class="unit-segment" @ion-change="onUnitChange">
        <ion-segment-button value="kg"><ion-label>kg</ion-label></ion-segment-button>
        <ion-segment-button value="lb"><ion-label>lb</ion-label></ion-segment-button>
      </ion-segment>

      <ion-list-header><ion-label>バーの重量</ion-label></ion-list-header>
      <div class="ion-padding-horizontal">
        <WeightInput :model-value="store.bar" :step="barStep" label="バーの重量" @update:model-value="store.setBar" />
      </div>

      <ion-list-header><ion-label>プレート</ion-label></ion-list-header>
      <PlateInventoryEditor />

      <div class="ion-padding">
        <ion-button expand="block" fill="outline" color="medium" @click="confirmReset">初期値に戻す</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  alertController,
  IonButton,
  IonContent,
  IonHeader,
  IonLabel,
  IonListHeader,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import type { Unit } from '@/domain/types'
import { toInternal } from '@/domain/units'
import PlateInventoryEditor from '@/components/PlateInventoryEditor.vue'
import WeightInput from '@/components/WeightInput.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const barStep = toInternal(0.5)

const onUnitChange = async (event: CustomEvent<{ value?: string | number }>) => {
  const unit = event.detail.value as Unit
  if (unit === store.unit) return
  const alert = await alertController.create({
    header: `${unit} に切り替えますか？`,
    message: 'バーとプレートは初期値に戻り、メンバーの重量は換算して近い重量に丸めます。セッションは終了します。',
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      { text: '切り替える', role: 'confirm' },
    ],
  })
  await alert.present()
  const { role } = await alert.onDidDismiss()
  if (role === 'confirm') store.setUnit(unit)
  // キャンセルしたときはセグメントの表示を元に戻す
  else (event.target as HTMLIonSegmentElement).value = store.unit
}

const confirmReset = async () => {
  const alert = await alertController.create({
    header: '初期値に戻しますか？',
    message: 'バーとプレートの設定が初期値に戻ります。',
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      { text: '戻す', role: 'destructive', handler: () => store.resetPlates() },
    ],
  })
  await alert.present()
}
</script>

<style scoped>
.unit-segment {
  margin: 0 16px;
  width: auto;
}
</style>
