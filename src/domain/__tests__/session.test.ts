import { describe, expect, it } from 'vitest'
import { advance, changeTarget, startSession, stepAt, syncMembers } from '../session'
import type { BarConfig, Member } from '../types'
import { defaultConfig, toInternal as w } from '../units'

const config: BarConfig = defaultConfig('kg')

const members = (): Member[] => [
  { id: 'a', name: 'A', target: w(80) },
  { id: 'b', name: 'B', target: w(60) },
  { id: 'c', name: 'C', target: w(70) },
  { id: 'd', name: 'D', target: w(100) },
]

const sum = (s: number[] | null) => (s ?? []).reduce((a, b) => a + b, 0)

describe('session', () => {
  it('軽い順に並び、全員の重量が合っている', () => {
    const ms = members()
    const session = startSession(config, ms)
    expect(session.order).toEqual(['b', 'c', 'a', 'd'])
    for (const m of ms) expect(config.bar + sum(session.assignments[m.id]) * 2).toBe(m.target)
  })

  it('全員に別々の色が付き、周をまたいでも変わらない', () => {
    let ms = members()
    let s = startSession(config, ms)
    const colors = s.colors
    expect(new Set(Object.values(colors)).size).toBe(4)
    // 並び順が変わっても色は付いてくる
    ms = ms.map((m) => (m.id === 'd' ? { ...m, target: w(40) } : m))
    for (let i = 0; i < 4; i++) s = advance(s, config, ms)
    expect(s.order[0]).toBe('d')
    expect(s.colors).toEqual(colors)
  })

  it('抜けた人の色は後から入った人に回る', () => {
    let ms = members()
    let s = startSession(config, ms)
    const colorOfC = s.colors.c
    ms = ms.filter((m) => m.id !== 'c')
    s = syncMembers(s, config, ms)
    expect(s.colors.c).toBeUndefined()
    ms = [...ms, { id: 'e', name: 'E', target: w(90) }]
    s = syncMembers(s, config, ms)
    expect(s.colors.e).toBe(colorOfC)
  })

  it('一巡したら次の周になり、最初の人に戻る', () => {
    const ms = members()
    let s = startSession(config, ms)
    for (let i = 0; i < 4; i++) s = advance(s, config, ms)
    expect(s.round).toBe(2)
    expect(s.index).toBe(0)
    expect(s.roundStart).toEqual(startSession(config, ms).assignments.d)
    expect(stepAt(s, 0).transition!.remove.length).toBeGreaterThan(0)
  })

  it('周の途中で重量を変えても、順番とそれより前の構成は変わらない', () => {
    let ms = members()
    let s = startSession(config, ms)
    s = advance(s, config, ms) // c の番
    const before = { ...s.assignments }
    ms = ms.map((m) => (m.id === 'a' ? { ...m, target: w(50) } : m))
    s = changeTarget(s, config, ms, 'a')
    expect(s.order).toEqual(['b', 'c', 'a', 'd'])
    expect(s.assignments.b).toEqual(before.b)
    expect(s.assignments.c).toEqual(before.c)
    expect(config.bar + sum(s.assignments.a) * 2).toBe(w(50))
    // 次の周で並べ直される
    s = advance(advance(advance(s, config, ms), config, ms), config, ms)
    expect(s.round).toBe(2)
    expect(s.order).toEqual(['a', 'b', 'c', 'd'])
  })

  it('今の人の重量を変えたら、その人から組み直す', () => {
    let ms = members()
    let s = startSession(config, ms)
    ms = ms.map((m) => (m.id === 'b' ? { ...m, target: w(65) } : m))
    s = changeTarget(s, config, ms, 'b')
    expect(config.bar + sum(s.assignments.b) * 2).toBe(w(65))
  })

  it('終わった人の変更は今の周に影響しない', () => {
    let ms = members()
    let s = startSession(config, ms)
    s = advance(s, config, ms)
    const before = s.assignments
    ms = ms.map((m) => (m.id === 'b' ? { ...m, target: w(90) } : m))
    expect(changeTarget(s, config, ms, 'b').assignments).toEqual(before)
  })

  it('作れない重量の人は null になり、前後はつながる', () => {
    const ms = [...members(), { id: 'e', name: 'E', target: w(70.3) }]
    const s = startSession(config, ms)
    expect(s.assignments.e).toBeNull()
    expect(stepAt(s, s.order.indexOf('e')).transition).toBeNull()
  })

  it('メンバーの追加・削除を反映する', () => {
    let ms = members()
    let s = startSession(config, ms)
    s = advance(s, config, ms) // c の番
    ms = [...ms.filter((m) => m.id !== 'b'), { id: 'e', name: 'E', target: w(40) }]
    s = syncMembers(s, config, ms)
    expect(s.order).toEqual(['c', 'a', 'd', 'e'])
    expect(s.order[s.index]).toBe('c')
    expect(config.bar + sum(s.assignments.e) * 2).toBe(w(40))
  })
})
