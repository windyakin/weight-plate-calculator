import { createRouter, createWebHashHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import TabsPage from '@/views/TabsPage.vue'

// ハッシュ履歴にしておくと、静的ホスティングやホーム画面追加でもサーバー設定なしで動く
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/tabs/session' },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      { path: '', redirect: '/tabs/session' },
      { path: 'session', component: () => import('@/views/SessionPage.vue') },
      { path: 'members', component: () => import('@/views/MembersPage.vue') },
      { path: 'setup', component: () => import('@/views/SetupPage.vue') },
    ],
  },
]

export default createRouter({ history: createWebHashHistory(), routes })
