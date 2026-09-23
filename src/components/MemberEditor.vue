<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="emit('cancel')">キャンセル</ion-button>
      </ion-buttons>
      <ion-title>{{ member ? 'メンバーを編集' : 'メンバーを追加' }}</ion-title>
      <ion-buttons slot="end">
        <ion-button strong :disabled="!canSave" @click="save">保存</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-list lines="none" class="name-list">
      <ion-item class="name-item">
        <ion-input v-model="name" label="名前" label-placement="stacked" :placeholder="`空欄なら ${defaultName}`" />
      </ion-item>
    </ion-list>
    <p class="field-label">重量（バー込み）</p>
    <WeightInput v-model="target" :step="weightInput.step" :min="store.bar" label="重量（バー込み）" />
    <div class="presets">
      <ion-button
        v-for="preset in presets"
        :key="preset"
        size="small"
        :fill="preset === target ? 'solid' : 'outline'"
        @click="target = preset"
      >
        {{ formatWeight(preset) }}
      </ion-button>
    </div>

    <div v-if="!check.exact" class="suggest">
      <p>
        <ion-text color="warning">{{ formatWeight(target) }}{{ store.unit }} は手持ちのプレートでは作れません。</ion-text>
      </p>
      <p v-if="check.lower === null && check.upper === null">プレートの設定を見直してください。</p>
      <div class="suggest-buttons">
        <ion-button v-if="check.lower !== null" fill="outline" @click="target = check.lower">
          {{ formatWeight(check.lower) }}{{ store.unit }} にする
        </ion-button>
        <ion-button v-if="check.upper !== null" fill="outline" @click="target = check.upper">
          {{ formatWeight(check.upper) }}{{ store.unit }} にする
        </ion-button>
      </div>
    </div>

    <ion-button v-if="member" class="delete" expand="block" fill="clear" color="danger" @click="confirmDelete">
      このメンバーを削除
    </ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import {
  alertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { computed, ref } from 'vue'
import { defaultMemberName } from '@/domain/members'
import type { Member } from '@/domain/types'
import { formatWeight, memberWeightInput } from '@/domain/units'
import { useAppStore } from '@/stores/app'
import WeightInput from './WeightInput.vue'

const props = defineProps<{ member?: Member; defaultTarget?: number }>()
const emit = defineEmits<{
  save: [value: { name: string; target: number }]
  cancel: []
  delete: []
}>()
const store = useAppStore()

const name = ref(props.member?.name ?? '')
const target = ref(props.member?.target ?? props.defaultTarget ?? store.bar)

const check = computed(() => store.achievability(target.value))
const canSave = computed(() => check.value.exact)

// 名前を空欄にしたときに付ける名前（編集中の本人の名前は使用済みに数えない）
const defaultName = computed(() =>
  defaultMemberName(store.members.filter((m) => m.id !== props.member?.id).map((m) => m.name)),
)

const weightInput = computed(() => memberWeightInput(store.unit))
const presets = computed(() => weightInput.value.presets.filter((w) => w >= store.bar))

const confirmDelete = async () => {
  const alert = await alertController.create({
    header: `${props.member?.name} を削除しますか？`,
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      { text: '削除', role: 'destructive', handler: () => emit('delete') },
    ],
  })
  await alert.present()
}

const save = () => {
  if (canSave.value) emit('save', { name: name.value.trim() || defaultName.value, target: target.value })
}
</script>

<style scoped>
.field-label {
  margin: 16px 0 8px;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
}
/* ion-item の左右の余白を消して、下の重量入力と左端を揃える */
.name-list {
  padding: 0;
}
.name-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}
.presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-top: 12px;
}
.presets ion-button {
  margin: 0;
}
.suggest {
  margin-top: 16px;
}
.suggest-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.delete {
  margin-top: 32px;
}
</style>
