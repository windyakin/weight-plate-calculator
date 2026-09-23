import { transitionCost } from './diff'
import type { Stack } from './types'

// 付け外しの枚数を最優先し、同じなら合計枚数が少ない構成を選ぶ
const MOVE_WEIGHT = 1000

const step = (from: Stack, to: Stack) => transitionCost(from, to) * MOVE_WEIGHT + to.length

interface Result {
  cost: number
  stacks: Stack[]
}

/**
 * 候補の並び lists から 1 つずつ選び、start からの付け外しが最小になるものを DP で求める。
 * closing を渡すと、最後の構成からの追加コストも足す（周回用）。
 */
const viterbi = (start: Stack, lists: Stack[][], closing?: (last: Stack) => number): Result => {
  if (lists.length === 0) return { cost: 0, stacks: [] }
  let costs = lists[0].map((c) => step(start, c))
  const back: number[][] = []
  for (let i = 1; i < lists.length; i++) {
    const prev = lists[i - 1]
    const from: number[] = []
    const next = lists[i].map((c) => {
      let best = Infinity
      let bestK = 0
      prev.forEach((p, k) => {
        const v = costs[k] + step(p, c)
        if (v < best) {
          best = v
          bestK = k
        }
      })
      from.push(bestK)
      return best
    })
    back.push(from)
    costs = next
  }
  const last = lists[lists.length - 1]
  let bestJ = 0
  let best = Infinity
  last.forEach((c, j) => {
    const v = costs[j] + (closing ? closing(c) : 0)
    if (v < best) {
      best = v
      bestJ = j
    }
  })
  const picks = [bestJ]
  for (let i = back.length - 1; i >= 0; i--) picks.unshift(back[i][picks[0]])
  return { cost: best, stacks: picks.map((j, i) => lists[i][j]) }
}

/** 周の途中から組み直す。start は今バーに付いているプレート。候補が空の人は含めないこと */
export const planRound = (start: Stack, lists: Stack[][]): Stack[] => viterbi(start, lists).stacks

/** 周の頭で組む。最後の人から最初の人に戻るときの付け替えも含めて最小にする */
export const planCycle = (start: Stack, lists: Stack[][]): Stack[] => {
  if (lists.length === 0) return []
  let best: Result | null = null
  for (const first of lists[0]) {
    const result = viterbi(start, [[first], ...lists.slice(1)], (last) => step(last, first))
    if (!best || result.cost < best.cost) best = result
  }
  return best!.stacks
}
