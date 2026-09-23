<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>メンバー</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list v-if="store.members.length">
        <ion-list-header><ion-label>軽い順</ion-label></ion-list-header>
        <ion-item v-for="(member, i) in store.sortedMembers" :key="member.id" button @click="openEditor(member)">
          <span slot="start" class="rank" :style="memberColorStyle(store.memberColors[member.id])">{{ i + 1 }}</span>
          <ion-label>
            <h2>{{ member.name }}</h2>
            <p v-if="!store.achievability(member.target).exact">
              <ion-text color="warning">今のプレートでは作れません</ion-text>
            </p>
          </ion-label>
          <span slot="end" class="weight">{{ formatWeight(member.target) }}<span class="unit">{{ store.unit }}</span></span>
        </ion-item>
      </ion-list>
      <div v-else class="empty ion-padding">
        <p>メンバーがいません。右下の＋から追加してください。</p>
      </div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button aria-label="メンバーを追加" @click="openEditor()">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <ion-modal :is-open="editing !== null" @did-dismiss="editing = null">
        <MemberEditor
          v-if="editing !== null"
          :member="editing.member"
          :default-target="lastTarget"
          @cancel="editing = null"
          @save="onSave"
          @delete="onDelete"
        />
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { add } from 'ionicons/icons'
import { computed, ref } from 'vue'
import MemberEditor from '@/components/MemberEditor.vue'
import { memberColorStyle } from '@/components/memberColor'
import type { Member } from '@/domain/types'
import { formatWeight } from '@/domain/units'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

const editing = ref<{ member?: Member } | null>(null)
// 新しく追加するときは、一番重い人の重量を初期値にすると入力が楽
const lastTarget = computed(() => store.sortedMembers.at(-1)?.target)

const openEditor = (member?: Member) => (editing.value = { member })

const onSave = ({ name, target }: { name: string; target: number }) => {
  const member = editing.value?.member
  if (member) store.updateMember(member.id, { name, target })
  else store.addMember(name, target)
  editing.value = null
}

const onDelete = () => {
  const member = editing.value?.member
  if (member) store.removeMember(member.id)
  editing.value = null
}
</script>

<style scoped>
/* 順位の丸をその人の色にして、セッション画面の色と対応が分かるようにする */
.rank {
  display: grid;
  place-items: center;
  width: 1.75em;
  height: 1.75em;
  border-radius: 50%;
  background: var(--member-color);
  color: #fff;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.weight {
  font-size: 1.3rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.empty {
  text-align: center;
  color: var(--ion-color-medium);
}
</style>
