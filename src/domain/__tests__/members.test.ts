import { describe, expect, it } from 'vitest'
import { defaultMemberName } from '../members'

describe('defaultMemberName', () => {
  it('まだ使われていない最初のアルファベットを返す', () => {
    expect(defaultMemberName([])).toBe('A')
    expect(defaultMemberName(['A', 'B'])).toBe('C')
    expect(defaultMemberName(['A', '山田', 'C'])).toBe('B')
  })
  it('Z の次は AA', () => {
    const used = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
    expect(defaultMemberName(used)).toBe('AA')
  })
})
