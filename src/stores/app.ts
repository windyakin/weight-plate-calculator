import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { assignColors } from '@/domain/colors'
import { nearestAchievable, type Achievability } from '@/domain/plates'
import * as flow from '@/domain/session'
import type { BarConfig, Member, PlateType, Session, Unit } from '@/domain/types'
import { convertWeight, defaultConfig } from '@/domain/units'
import { loadState, saveState } from './persist'

export type InputMode = 'total' | 'pairs'

interface PersistedState {
  unit: Unit
  bar: number
  plates: PlateType[]
  inputMode: InputMode
  members: Member[]
  session: Session | null
  nextId: number
}

const initialState = (): PersistedState => ({
  unit: 'kg',
  ...defaultConfig('kg'),
  inputMode: 'total',
  members: [],
  session: null,
  nextId: 1,
})

export const useAppStore = defineStore('app', () => {
  const saved = { ...initialState(), ...loadState<PersistedState>() }

  const unit = ref<Unit>(saved.unit)
  const bar = ref(saved.bar)
  const plates = ref<PlateType[]>(saved.plates)
  const inputMode = ref<InputMode>(saved.inputMode)
  const members = ref<Member[]>(saved.members)
  // 色の割り当てがなかった頃に保存されたセッションにも色を付ける
  const session = ref<Session | null>(
    saved.session && { ...saved.session, colors: assignColors(saved.session.order, saved.session.colors) },
  )
  const nextId = ref(saved.nextId)

  const config = computed<BarConfig>(() => ({ bar: bar.value, plates: plates.value }))

  /** 入力できる重量の刻み（一番軽いプレートを左右に付けた分） */
  const step = computed(() => {
    const weights = plates.value.filter((p) => p.pairs > 0).map((p) => p.weight)
    return weights.length ? Math.min(...weights) * 2 : 100
  })

  const sortedMembers = computed(() => {
    const byId = new Map(members.value.map((m) => [m.id, m]))
    return flow.sortedOrder(members.value).map((id) => byId.get(id)!)
  })

  /**
   * 各メンバーの色番号。セッション中はセッションの割り当て、
   * セッション前は開始したときに付く色（軽い順に割り当てたもの）を先に見せる
   */
  const memberColors = computed(() =>
    session.value ? session.value.colors : assignColors(flow.sortedOrder(members.value)),
  )

  const memberById = (id: string) => members.value.find((m) => m.id === id)

  const achievability = (target: number): Achievability => nearestAchievable(target, bar.value, plates.value)

  // --- 設定 ---

  /** バーやプレートが変わったら、今の人の次から組み直す */
  const replanAfterConfigChange = () => {
    if (session.value) {
      session.value = flow.replanFrom(session.value, config.value, members.value, session.value.index + 1)
    }
  }

  const setBar = (value: number) => {
    bar.value = value
    replanAfterConfigChange()
  }

  const setPlates = (value: PlateType[]) => {
    plates.value = [...value].sort((a, b) => b.weight - a.weight)
    replanAfterConfigChange()
  }

  /** 単位を切り替える。プレートとバーは初期値に戻し、メンバーの重量は換算して作れる重量に丸める */
  const setUnit = (value: Unit) => {
    if (value === unit.value) return
    const from = unit.value
    const next = defaultConfig(value)
    members.value = members.value.map((m) => {
      const converted = convertWeight(m.target, from, value)
      const { lower, upper } = nearestAchievable(converted, next.bar, next.plates)
      const candidates = [lower, upper].filter((v): v is number => v !== null)
      const target = candidates.sort((a, b) => Math.abs(a - converted) - Math.abs(b - converted))[0] ?? converted
      return { ...m, target }
    })
    unit.value = value
    bar.value = next.bar
    plates.value = next.plates
    session.value = null
  }

  const resetPlates = () => {
    const next = defaultConfig(unit.value)
    bar.value = next.bar
    setPlates(next.plates)
  }

  // --- メンバー ---

  const addMember = (name: string, target: number) => {
    members.value = [...members.value, { id: `m${nextId.value++}`, name, target }]
    if (session.value) session.value = flow.syncMembers(session.value, config.value, members.value)
  }

  const updateMember = (id: string, patch: Partial<Omit<Member, 'id'>>) => {
    const before = memberById(id)
    members.value = members.value.map((m) => (m.id === id ? { ...m, ...patch } : m))
    if (session.value && before && patch.target !== undefined && patch.target !== before.target) {
      session.value = flow.changeTarget(session.value, config.value, members.value, id)
    }
  }

  const removeMember = (id: string) => {
    members.value = members.value.filter((m) => m.id !== id)
    if (session.value) {
      session.value = members.value.length ? flow.syncMembers(session.value, config.value, members.value) : null
    }
  }

  // --- セッション ---

  const startSession = () => {
    session.value = members.value.length ? flow.startSession(config.value, members.value) : null
  }

  const next = () => {
    if (session.value) session.value = flow.advance(session.value, config.value, members.value)
  }

  const back = () => {
    if (session.value) session.value = flow.goBack(session.value)
  }

  const endSession = () => {
    session.value = null
  }

  watch(
    [unit, bar, plates, inputMode, members, session, nextId],
    () =>
      saveState<PersistedState>({
        unit: unit.value,
        bar: bar.value,
        plates: plates.value,
        inputMode: inputMode.value,
        members: members.value,
        session: session.value,
        nextId: nextId.value,
      }),
    { deep: true },
  )

  return {
    unit,
    bar,
    plates,
    inputMode,
    members,
    session,
    config,
    step,
    sortedMembers,
    memberColors,
    memberById,
    achievability,
    setBar,
    setPlates,
    setUnit,
    resetPlates,
    addMember,
    updateMember,
    removeMember,
    startSession,
    next,
    back,
    endSession,
  }
})
