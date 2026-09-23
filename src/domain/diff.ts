import type { Stack } from './types'

export interface Transition {
  /** 外すプレート（外側から順に） */
  remove: Stack
  /** 付けるプレート（内側から順に） */
  add: Stack
  /** 片側あたりの付け外しの枚数 */
  cost: number
}

/** プレートは外側からしか外せないので、共通する内側部分より外側を全部付け替える */
export const transition = (from: Stack, to: Stack): Transition => {
  let p = 0
  while (p < from.length && p < to.length && from[p] === to[p]) p++
  return {
    remove: from.slice(p).reverse(),
    add: to.slice(p),
    cost: from.length - p + (to.length - p),
  }
}

export const transitionCost = (from: Stack, to: Stack): number => transition(from, to).cost
