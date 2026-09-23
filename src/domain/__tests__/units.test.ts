import { describe, expect, it } from 'vitest'
import { convertWeight, formatWeight, toInternal } from '../units'

describe('units', () => {
  it('小数の重量を誤差なく扱う', () => {
    expect(toInternal(1.25)).toBe(125)
    expect(toInternal(0.1 + 0.2)).toBe(30)
    expect(formatWeight(toInternal(62.5))).toBe('62.5')
  })
  it('kg と lb の換算', () => {
    expect(convertWeight(toInternal(100), 'kg', 'lb')).toBe(22046)
    expect(convertWeight(toInternal(225), 'lb', 'kg')).toBe(10206)
  })
})
