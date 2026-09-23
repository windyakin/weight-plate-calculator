// 重量はすべて 0.01 単位の整数で扱う（例: 1.25kg → 125）。浮動小数点の誤差を避けるため。

export type Unit = 'kg' | 'lb'

export interface PlateType {
  /** プレート 1 枚の重量 */
  weight: number
  /** 片側に付けられる枚数（＝ペア数） */
  pairs: number
  /** 総枚数が奇数で 1 枚余っているか（表示用。計算には使わない） */
  odd?: boolean
}

/** 片側に付けるプレートを内側から順に並べたもの。常に重い順になっている */
export type Stack = number[]

export interface Member {
  id: string
  name: string
  target: number
}

export interface BarConfig {
  bar: number
  plates: PlateType[]
}

export interface Session {
  /** 今の周の順番（メンバー ID） */
  order: string[]
  /** 何周目か（1 始まり） */
  round: number
  /** 今の周で何番目の人の番か */
  index: number
  /** 各メンバーの片側の構成。作れない重量なら null */
  assignments: Record<string, Stack | null>
  /** 周の始まりにバーに付いていたプレート */
  roundStart: Stack
  /** 各メンバーの色番号。セッション中は周をまたいでも変わらない */
  colors: Record<string, number>
}
