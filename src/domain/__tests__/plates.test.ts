import { describe, expect, it } from 'vitest'
import { candidateStacks, enumerateStacks, nearestAchievable, perSideWeight } from '../plates'
import { toInternal as w } from '../units'

const plates = [
  { weight: w(20), pairs: 2 },
  { weight: w(10), pairs: 2 },
  { weight: w(5), pairs: 1 },
  { weight: w(2.5), pairs: 1 },
  { weight: w(1.25), pairs: 1 },
]

describe('perSideWeight', () => {
  it('バーより軽い・左右に分けられない重量は null', () => {
    expect(perSideWeight(w(15), w(20))).toBeNull()
    expect(perSideWeight(w(20) + 1, w(20))).toBeNull()
    expect(perSideWeight(w(60), w(20))).toBe(w(20))
  })
})

describe('enumerateStacks', () => {
  it('重い順に並び、枚数の上限を守る', () => {
    const stacks = enumerateStacks(w(20), plates)
    expect(stacks).toContainEqual([w(20)])
    expect(stacks).toContainEqual([w(10), w(10)])
    for (const s of stacks) {
      expect([...s].sort((a, b) => b - a)).toEqual(s)
      expect(s.filter((x) => x === w(5)).length).toBeLessThanOrEqual(1)
      expect(s.reduce((a, b) => a + b, 0)).toBe(w(20))
    }
    // 枚数の少ない順
    expect(stacks[0]).toEqual([w(20)])
  })

  it('作れないときは空', () => {
    expect(enumerateStacks(w(0.5), plates)).toEqual([])
    expect(enumerateStacks(w(100), plates)).toEqual([])
  })

  it('0 のときは何も付けない構成を返す', () => {
    expect(enumerateStacks(0, plates)).toEqual([[]])
  })

  it('小数の重量でも誤差が出ない', () => {
    expect(candidateStacks(w(22.5), w(20), plates)).toEqual([[w(1.25)]])
  })
})

describe('nearestAchievable', () => {
  it('ぴったり作れる', () => {
    expect(nearestAchievable(w(60), w(20), plates)).toEqual({ exact: true, lower: w(60), upper: w(60) })
  })
  it('上下で一番近い重量を返す', () => {
    // 片側 0〜67.5 を 1.25 刻みの一部で作れる。61 → 60 / 62.5
    expect(nearestAchievable(w(61), w(20), plates)).toEqual({ exact: false, lower: w(60), upper: w(62.5) })
  })
  it('範囲外', () => {
    expect(nearestAchievable(w(10), w(20), plates)).toEqual({ exact: false, lower: null, upper: w(20) })
    expect(nearestAchievable(w(500), w(20), plates).upper).toBeNull()
  })
})
