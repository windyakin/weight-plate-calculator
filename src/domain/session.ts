import { assignColors } from './colors'
import { transition, type Transition } from './diff'
import { candidateStacks } from './plates'
import { planCycle, planRound } from './planner'
import type { BarConfig, Member, Session, Stack } from './types'

/** 軽い順に並べる。同じ重量なら登録順 */
export const sortedOrder = (members: Member[]): string[] =>
  members
    .map((m, i) => ({ m, i }))
    .sort((a, b) => a.m.target - b.m.target || a.i - b.i)
    .map(({ m }) => m.id)

const memberMap = (members: Member[]) => new Map(members.map((m) => [m.id, m]))

/** order[from..] の構成を start から組む。作れない人は null にして飛ばす */
const plan = (
  ids: string[],
  start: Stack,
  config: BarConfig,
  members: Member[],
  planner: typeof planRound,
): Record<string, Stack | null> => {
  const byId = memberMap(members)
  const solvable: string[] = []
  const lists: Stack[][] = []
  const result: Record<string, Stack | null> = {}
  for (const id of ids) {
    const member = byId.get(id)
    const list = member ? candidateStacks(member.target, config.bar, config.plates) : []
    if (list.length === 0) {
      result[id] = null
    } else {
      solvable.push(id)
      lists.push(list)
    }
  }
  planner(start, lists).forEach((stack, i) => (result[solvable[i]] = stack))
  return result
}

/** i 番目の人の番が来る直前にバーに付いているプレート */
export const barBefore = (session: Session, i: number): Stack => {
  for (let k = i - 1; k >= 0; k--) {
    const stack = session.assignments[session.order[k]]
    if (stack) return stack
  }
  return session.roundStart
}

const startRound = (
  config: BarConfig,
  members: Member[],
  round: number,
  roundStart: Stack,
  colors: Record<string, number>,
): Session => {
  const order = sortedOrder(members)
  return {
    order,
    round,
    index: 0,
    roundStart,
    assignments: plan(order, roundStart, config, members, planCycle),
    colors: assignColors(order, colors),
  }
}

export const startSession = (config: BarConfig, members: Member[]): Session =>
  startRound(config, members, 1, [], {})

/** fromIndex 以降の人の構成を、その直前の状態から組み直す */
export const replanFrom = (session: Session, config: BarConfig, members: Member[], fromIndex: number): Session => {
  const ids = session.order.slice(fromIndex)
  if (ids.length === 0) return session
  return {
    ...session,
    assignments: {
      ...session.assignments,
      ...plan(ids, barBefore(session, fromIndex), config, members, planRound),
    },
  }
}

export const advance = (session: Session, config: BarConfig, members: Member[]): Session => {
  if (session.index < session.order.length - 1) return { ...session, index: session.index + 1 }
  // 一巡したら、今バーに付いているプレートから次の周を組む
  return startRound(config, members, session.round + 1, barBefore(session, session.order.length), session.colors)
}

export const goBack = (session: Session): Session =>
  session.index > 0 ? { ...session, index: session.index - 1 } : session

/**
 * members は変更後の一覧。変更された人がまだ番が来ていなければ、その人以降を組み直す。
 * 今の人の場合はその人から、それより後の人の場合は今の人の次から組み直す
 * （今の人のプレートは付けてある前提なので動かさない）。
 * この周で終わっている人の変更は、次の周の頭で反映される。
 */
export const changeTarget = (session: Session, config: BarConfig, members: Member[], memberId: string): Session => {
  const position = session.order.indexOf(memberId)
  if (position < session.index) return session
  return replanFrom(session, config, members, position === session.index ? position : session.index + 1)
}

/**
 * メンバーの追加・削除をセッションに反映する。
 * 追加された人は今の周の最後に回し、削除された人は順番から外す。
 */
export const syncMembers = (session: Session, config: BarConfig, members: Member[]): Session => {
  const ids = new Set(members.map((m) => m.id))
  const removedBefore = session.order.slice(0, session.index).filter((id) => !ids.has(id)).length
  const kept = session.order.filter((id) => ids.has(id))
  const added = sortedOrder(members).filter((id) => !session.order.includes(id))
  if (kept.length === session.order.length && added.length === 0) return session
  const order = [...kept, ...added]
  if (order.length === 0) return { ...session, order, index: 0, assignments: {}, colors: {} }
  const index = Math.min(session.index - removedBefore, order.length - 1)
  const assignments = Object.fromEntries(order.map((id) => [id, session.assignments[id] ?? null]))
  // 抜けた人の色は空くので、後から入った人に回す
  const colors = assignColors(order, session.colors)
  const next = { ...session, order, index: Math.max(index, 0), assignments, colors }
  // 今の人が消えた場合はその位置から、それ以外は今の人の次から組み直す
  const currentRemoved = !ids.has(session.order[session.index])
  return replanFrom(next, config, members, currentRemoved ? next.index : next.index + 1)
}

export interface Step {
  memberId: string
  stack: Stack | null
  transition: Transition | null
}

/** i 番目の人の構成と、直前からの付け替え内容 */
export const stepAt = (session: Session, i: number): Step => {
  const memberId = session.order[i]
  const stack = session.assignments[memberId] ?? null
  return { memberId, stack, transition: stack ? transition(barBefore(session, i), stack) : null }
}
