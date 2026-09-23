import { describe, expect, it } from 'vitest'
import { transitionCost } from '../diff'
import { candidateStacks } from '../plates'
import { planCycle, planRound } from '../planner'
import type { Stack } from '../types'
import { toInternal as w } from '../units'

const plates = [
  { weight: w(20), pairs: 2 },
  { weight: w(15), pairs: 1 },
  { weight: w(10), pairs: 2 },
  { weight: w(5), pairs: 2 },
  { weight: w(2.5), pairs: 1 },
]
const bar = w(20)

const moves = (start: Stack, stacks: Stack[], cycle: boolean) => {
  let total = 0
  let prev = start
  for (const s of stacks) {
    total += transitionCost(prev, s)
    prev = s
  }
  if (cycle && stacks.length) total += transitionCost(prev, stacks[0])
  return total
}

const bruteForce = (start: Stack, lists: Stack[][], cycle: boolean) => {
  let best = Infinity
  const walk = (i: number, picked: Stack[]) => {
    if (i === lists.length) {
      best = Math.min(best, moves(start, picked, cycle))
      return
    }
    for (const c of lists[i]) walk(i + 1, [...picked, c])
  }
  walk(0, [])
  return best
}

const scenarios = [
  [60, 65, 70, 100],
  [40, 50, 60, 70, 80],
  [50, 50, 90],
  [30, 45, 65, 85, 105],
].map((s) => s.map(w))

describe('planner', () => {
  it.each(scenarios.map((s) => [s]))('planRound は総当たりの最小と一致する (%#)', (targets) => {
    const lists = targets.map((t) => candidateStacks(t, bar, plates))
    const plan = planRound([], lists)
    plan.forEach((s, i) => expect(lists[i]).toContainEqual(s))
    expect(moves([], plan, false)).toBe(bruteForce([], lists, false))
  })

  it.each(scenarios.map((s) => [s]))('planCycle は戻りを含めて総当たりの最小と一致する (%#)', (targets) => {
    const lists = targets.map((t) => candidateStacks(t, bar, plates))
    const start = [w(20)]
    const plan = planCycle(start, lists)
    expect(moves(start, plan, true)).toBe(bruteForce(start, lists, true))
  })

  it('付け替えが同じなら枚数が少ない構成を選ぶ', () => {
    const lists = [candidateStacks(w(60), bar, plates)]
    expect(planRound([], lists)).toEqual([[w(20)]])
  })

  it('付け替えを減らすために枚数の多い構成を選ぶことがある', () => {
    // 50kg: 15 / 10+5, 60kg: 20 / 15+5 / 10+10 ...
    const lists = [w(50), w(60)].map((t) => candidateStacks(t, bar, plates))
    const plan = planRound([], lists)
    expect(moves([], plan, false)).toBe(bruteForce([], lists, false))
  })
})
