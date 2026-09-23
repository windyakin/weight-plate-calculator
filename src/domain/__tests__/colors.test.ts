import { describe, expect, it } from 'vitest'
import { assignColors, MEMBER_COLOR_COUNT } from '../colors'

describe('assignColors', () => {
  it('色がない人には使われていない色を若い順に割り当てる', () => {
    expect(assignColors(['a', 'b', 'c'])).toEqual({ a: 0, b: 1, c: 2 })
    expect(assignColors(['a', 'b', 'c'], { b: 0 })).toEqual({ a: 1, b: 0, c: 2 })
  })

  it('既にある色は変えず、いなくなった人の色は空ける', () => {
    expect(assignColors(['b', 'd'], { a: 0, b: 1, c: 2 })).toEqual({ b: 1, d: 0 })
  })

  it('色が足りないときは使っている人が一番少ない色を使う', () => {
    const ids = Array.from({ length: MEMBER_COLOR_COUNT + 2 }, (_, i) => `m${i}`)
    const colors = assignColors(ids)
    expect(colors[`m${MEMBER_COLOR_COUNT}`]).toBe(0)
    expect(colors[`m${MEMBER_COLOR_COUNT + 1}`]).toBe(1)
  })
})
