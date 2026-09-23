import type { Unit } from '@/domain/types'
import { fromInternal } from '@/domain/units'

// 競技用プレートの色分けに合わせる（知らない重量はグレー）
const KG_COLORS: Record<number, string> = {
  25: 'red',
  20: 'blue',
  15: 'yellow',
  10: 'green',
  5: 'white',
  2.5: 'red',
  2: 'blue',
  1.5: 'yellow',
  1.25: 'silver',
  1: 'green',
  0.5: 'silver',
}

const LB_COLORS: Record<number, string> = {
  55: 'red',
  45: 'blue',
  35: 'yellow',
  25: 'green',
  10: 'white',
  5: 'silver',
  2.5: 'silver',
}

const DARK_TEXT = new Set(['yellow', 'white', 'silver'])

export const plateColorName = (weight: number, unit: Unit): string =>
  (unit === 'kg' ? KG_COLORS : LB_COLORS)[fromInternal(weight)] ?? 'black'

export const plateStyle = (weight: number, unit: Unit) => {
  const name = plateColorName(weight, unit)
  return {
    background: `var(--plate-${name})`,
    color: DARK_TEXT.has(name) ? '#222' : '#fff',
  }
}
