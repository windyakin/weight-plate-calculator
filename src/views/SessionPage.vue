<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ session ? `${session.round} 周目　${session.index + 1} / ${session.order.length}` : 'セッション' }}</ion-title>
        <ion-buttons v-if="session" slot="end">
          <ion-button color="medium" @click="confirmEnd">終了</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content v-if="session && current">
      <ion-card class="current member-card" :style="colorStyle(current.memberId)">
        <ion-card-header>
          <ion-card-subtitle>今の番</ion-card-subtitle>
          <ion-card-title @click="openEditor(current.memberId)">{{ nameOf(current.memberId) }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <WeightInput
            class="current-weight"
            :model-value="store.memberById(current.memberId)?.target ?? 0"
            :step="weightStep"
            :min="store.bar"
            :label="`${nameOf(current.memberId)} の重量`"
            @update:model-value="(target) => store.updateMember(current!.memberId, { target })"
          />
          <template v-if="current.stack && current.transition">
            <BarbellView :stack="current.stack" />
            <PlateDiff :transition="current.transition" />
          </template>
          <ion-text v-else color="warning">
            <p>この重量は手持ちのプレートでは作れません。重量かプレートの設定を見直してください。</p>
          </ion-text>
        </ion-card-content>
      </ion-card>

      <!-- 今の人より後の人を順番どおりに。最後の人のときは次の周の最初の人を先に計算して見せる -->
      <ion-card
        v-for="({ step, label }, k) in upcomingSteps"
        :key="step.memberId"
        button
        class="member-card"
        :style="colorStyle(step.memberId)"
        @click="openEditor(step.memberId)"
      >
        <ion-card-header>
          <ion-card-subtitle>{{ label }}</ion-card-subtitle>
          <ion-card-title :class="{ small: k > 0 }">
            {{ nameOf(step.memberId) }}<span class="card-weight">{{ weightOf(step.memberId) }}<span class="unit">{{ store.unit }}</span></span>
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <PlateDiff v-if="step.transition" :transition="step.transition" />
          <ion-text v-else color="warning"><p>作れない重量です</p></ion-text>
        </ion-card-content>
      </ion-card>

      <!-- この周で終わった人。重量の変更は次の周の頭で反映される -->
      <ion-card
        v-for="id in doneIds"
        :key="id"
        button
        class="member-card done"
        :style="colorStyle(id)"
        @click="openEditor(id)"
      >
        <ion-card-header>
          <ion-card-subtitle>済</ion-card-subtitle>
          <ion-card-title class="small">
            {{ nameOf(id) }}<span class="card-weight">{{ weightOf(id) }}<span class="unit">{{ store.unit }}</span></span>
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <template v-if="session.assignments[id]">片側 {{ sideText(session.assignments[id]!) }}</template>
          <ion-text v-else color="warning">作れません</ion-text>
        </ion-card-content>
      </ion-card>
    </ion-content>

    <ion-footer v-if="session && current">
      <ion-toolbar>
        <!-- 人によってカードの高さが変わっても押す位置が変わらないよう、下に固定する -->
        <div class="controls">
          <ion-button fill="outline" size="large" :disabled="session.index === 0" @click="guarded(store.back)">
            <ion-icon slot="start" :icon="chevronBack" />戻る
          </ion-button>
          <ion-button class="next" size="large" @click="guarded(store.next)">
            {{ isLast ? '次の周へ' : '次へ' }}<ion-icon slot="end" :icon="chevronForward" />
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>

    <ion-content v-else class="ion-padding">
      <div class="empty">
        <p>セッションが始まっていません。</p>
        <ion-button v-if="store.members.length" size="large" @click="store.startSession()">セッション開始</ion-button>
        <ion-button v-else router-link="/tabs/members">メンバーを登録する</ion-button>
      </div>
    </ion-content>

    <ion-modal :is-open="editingId !== null" @did-dismiss="editingId = null">
      <MemberEditor
        v-if="editingMember"
        :member="editingMember"
        @cancel="editingId = null"
        @save="onSave"
        @delete="onDelete"
      />
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  alertController,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { chevronBack, chevronForward } from 'ionicons/icons'
import { computed, ref } from 'vue'
import BarbellView from '@/components/BarbellView.vue'
import MemberEditor from '@/components/MemberEditor.vue'
import { memberColorStyle } from '@/components/memberColor'
import PlateDiff from '@/components/PlateDiff.vue'
import WeightInput from '@/components/WeightInput.vue'
import { advance, stepAt } from '@/domain/session'
import type { Stack } from '@/domain/types'
import { formatWeight, memberWeightInput } from '@/domain/units'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const session = computed(() => store.session)

const current = computed(() => (session.value?.order.length ? stepAt(session.value, session.value.index) : null))
const isLast = computed(() => !!session.value && session.value.index === session.value.order.length - 1)

/** 今の人より後に番が来る人。最後の人のときは次の周の最初の人を先に計算して見せる */
const upcomingSteps = computed(() => {
  const s = session.value
  if (!s || s.order.length < 2) return []
  if (isLast.value) return [{ step: stepAt(advance(s, store.config, store.members), 0), label: '次（次の周）' }]
  return s.order.slice(s.index + 1).map((_, k) => ({
    step: stepAt(s, s.index + 1 + k),
    label: k === 0 ? '次' : `${k + 1} 人後`,
  }))
})

/** この周で終わった人。次の周の最初の人として上に出ている人は除く */
const doneIds = computed(() => {
  const s = session.value
  if (!s) return []
  const shown = new Set(upcomingSteps.value.map(({ step }) => step.memberId))
  return s.order.slice(0, s.index).filter((id) => !shown.has(id))
})

/** 今の人の重量をその場で変えるときの刻み。メンバー編集と同じにする */
const weightStep = computed(() => memberWeightInput(store.unit).step)

const nameOf = (id: string) => store.memberById(id)?.name ?? ''
const weightOf = (id: string) => {
  const member = store.memberById(id)
  return member ? formatWeight(member.target) : ''
}
/** カードの上端やアイコンをその人の色にする */
const colorStyle = (id: string) => memberColorStyle(store.memberColors[id])
const sideText = (stack: Stack) => (stack.length ? stack.map(formatWeight).join(' + ') : 'なし')

// 素早く 2 回タップすると 2 人分進んでしまい、最後の人が一瞬で飛ばされて次の周になるので、
// 直前の操作から少しの間は戻る・次への操作を受け付けない
const TAP_GUARD_MS = 400
let lastTapAt = 0
const guarded = (action: () => void) => {
  const now = Date.now()
  if (now - lastTapAt < TAP_GUARD_MS) return
  lastTapAt = now
  action()
}

const editingId = ref<string | null>(null)
const editingMember = computed(() => (editingId.value ? store.memberById(editingId.value) : undefined))
const openEditor = (id: string) => (editingId.value = id)

const onSave = ({ name, target }: { name: string; target: number }) => {
  if (editingId.value) store.updateMember(editingId.value, { name, target })
  editingId.value = null
}

const onDelete = () => {
  if (editingId.value) store.removeMember(editingId.value)
  editingId.value = null
}

const confirmEnd = async () => {
  const alert = await alertController.create({
    header: 'セッションを終了しますか？',
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      { text: '終了する', role: 'destructive', handler: () => store.endSession() },
    ],
  })
  await alert.present()
}
</script>

<style scoped>
.member-card {
  border-top: 6px solid var(--member-color);
}
.current-weight {
  margin-bottom: 12px;
}
/* セッション中は離れた所からも読めるよう、今の人の重量は大きく出す */
.current-weight :deep(.value) {
  font-size: 2.25rem;
  font-variant-numeric: tabular-nums;
}
.controls {
  display: flex;
  gap: 8px;
  padding: 0 10px;
}
.controls .next {
  flex: 1;
}
.card-weight {
  float: right;
  font-variant-numeric: tabular-nums;
}
.card-weight .unit {
  font-size: 0.7em;
  margin-left: 2px;
}
ion-card-title.small {
  font-size: 1.2rem;
}
.done {
  opacity: 0.55;
}
.empty {
  text-align: center;
  margin-top: 30%;
  color: var(--ion-color-medium);
}
</style>
