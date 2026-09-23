import type { BarConfig, Unit } from './types'

export const SCALE = 100

export const toInternal = (value: number): number => Math.round(value * SCALE)

export const fromInternal = (value: number): number => value / SCALE

export const formatWeight = (value: number): string => String(fromInternal(value))

export const LB_PER_KG = 2.20462

export const defaultConfig = (unit: Unit): BarConfig =>
  unit === 'kg'
    ? {
        bar: toInternal(20),
        plates: [
          { weight: toInternal(25), pairs: 2 },
          { weight: toInternal(20), pairs: 2 },
          { weight: toInternal(15), pairs: 1 },
          { weight: toInternal(10), pairs: 2 },
          { weight: toInternal(5), pairs: 2 },
          { weight: toInternal(2.5), pairs: 2 },
          { weight: toInternal(1.25), pairs: 2 },
          { weight: toInternal(0.5), pairs: 2 },
        ],
      }
    : {
        bar: toInternal(45),
        plates: [
          { weight: toInternal(45), pairs: 4 },
          { weight: toInternal(35), pairs: 1 },
          { weight: toInternal(25), pairs: 2 },
          { weight: toInternal(10), pairs: 2 },
          { weight: toInternal(5), pairs: 2 },
          { weight: toInternal(2.5), pairs: 2 },
        ],
      }

/** メンバーの重量入力で使う ± の刻みとプリセット */
export const memberWeightInput = (unit: Unit): { step: number; presets: number[] } =>
  unit === 'kg'
    ? { step: toInternal(5), presets: [30, 40, 50, 60, 70, 80, 90, 100].map(toInternal) }
    : // lb はバー 45lb に 10/25/35/45lb を片側 1〜2 枚ずつ付けた、よく使う重量
      { step: toInternal(10), presets: [65, 95, 115, 135, 155, 185, 205, 225].map(toInternal) }

/** 単位を切り替えたときの重量の換算（丸めはしない） */
export const convertWeight = (value: number, from: Unit, to: Unit): number => {
  if (from === to) return value
  return Math.round(from === 'kg' ? value * LB_PER_KG : value / LB_PER_KG)
}
