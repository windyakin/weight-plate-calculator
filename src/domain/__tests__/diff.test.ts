import { describe, expect, it } from 'vitest'
import { transition } from '../diff'

describe('transition', () => {
  it('共通する内側部分は残す', () => {
    expect(transition([20, 10, 5], [20, 10, 2])).toEqual({ remove: [5], add: [2], cost: 2 })
  })
  it('内側が違えば全部付け替える。外すのは外側から', () => {
    expect(transition([20, 5], [10, 5])).toEqual({ remove: [5, 20], add: [10, 5], cost: 4 })
  })
  it('足すだけ・外すだけ', () => {
    expect(transition([20], [20, 10])).toEqual({ remove: [], add: [10], cost: 1 })
    expect(transition([20, 10], [])).toEqual({ remove: [10, 20], add: [], cost: 2 })
  })
})
