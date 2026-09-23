import type { PlateType, Stack } from './types'

const usablePlates = (plates: PlateType[]): PlateType[] =>
  plates.filter((p) => p.weight > 0 && p.pairs > 0).sort((a, b) => b.weight - a.weight)

/** 目標の総重量から片側の重量を求める。バーより軽い・左右に分けられない場合は null */
export const perSideWeight = (target: number, bar: number): number | null => {
  const rest = target - bar
  if (rest < 0 || rest % 2 !== 0) return null
  return rest / 2
}

export const stackWeight = (stack: Stack): number => stack.reduce((sum, w) => sum + w, 0)

/**
 * 片側の重量 perSide をちょうど作れるプレートの組み合わせを列挙する。
 * 枚数の少ない順に最大 limit 件まで返す。
 */
export const enumerateStacks = (perSide: number, plates: PlateType[], limit = 50): Stack[] => {
  const types = usablePlates(plates)
  // i 番目以降のプレートを全部使ったときの重量（枝刈り用）
  const suffixMax: number[] = new Array(types.length + 1).fill(0)
  for (let i = types.length - 1; i >= 0; i--) {
    suffixMax[i] = suffixMax[i + 1] + types[i].weight * types[i].pairs
  }

  const found: Stack[] = []
  const hardCap = limit * 40
  const current: number[] = []

  const dfs = (i: number, remaining: number) => {
    if (found.length >= hardCap) return
    if (remaining === 0) {
      found.push([...current])
      return
    }
    if (i >= types.length || remaining > suffixMax[i]) return
    const { weight, pairs } = types[i]
    const maxCount = Math.min(pairs, Math.floor(remaining / weight))
    for (let count = maxCount; count >= 0; count--) {
      for (let k = 0; k < count; k++) current.push(weight)
      dfs(i + 1, remaining - weight * count)
      current.length -= count
    }
  }

  dfs(0, perSide)
  return found.sort((a, b) => a.length - b.length).slice(0, limit)
}

/** 目標の総重量を作れる構成の候補 */
export const candidateStacks = (target: number, bar: number, plates: PlateType[], limit = 50): Stack[] => {
  const perSide = perSideWeight(target, bar)
  return perSide === null ? [] : enumerateStacks(perSide, plates, limit)
}

/** 片側で作れる重量の一覧（昇順） */
export const reachablePerSide = (plates: PlateType[]): number[] => {
  const types = usablePlates(plates)
  const max = types.reduce((sum, p) => sum + p.weight * p.pairs, 0)
  const reachable = new Uint8Array(max + 1)
  reachable[0] = 1
  for (const { weight, pairs } of types) {
    for (let k = 0; k < pairs; k++) {
      for (let s = max; s >= weight; s--) {
        if (reachable[s - weight]) reachable[s] = 1
      }
    }
  }
  const result: number[] = []
  reachable.forEach((v, s) => v && result.push(s))
  return result
}

export interface Achievability {
  exact: boolean
  /** 目標以下で一番重い、作れる総重量 */
  lower: number | null
  /** 目標以上で一番軽い、作れる総重量 */
  upper: number | null
}

export const nearestAchievable = (target: number, bar: number, plates: PlateType[]): Achievability => {
  let lower: number | null = null
  let upper: number | null = null
  for (const perSide of reachablePerSide(plates)) {
    const total = bar + perSide * 2
    if (total <= target) lower = total
    if (total >= target && upper === null) upper = total
  }
  return { exact: lower === target, lower, upper }
}
