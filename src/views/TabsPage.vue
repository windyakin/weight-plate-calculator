<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="session" href="/tabs/session">
          <ion-icon :icon="barbell" />
          <ion-label>セッション</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="members" href="/tabs/members">
          <ion-icon :icon="people" />
          <ion-label>メンバー</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="setup" href="/tabs/setup">
          <ion-icon :icon="settings" />
          <ion-label>設定</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue'
import { barbell, people, settings } from 'ionicons/icons'
</script>
