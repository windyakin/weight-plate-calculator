/** メンバーに割り当てる色の数（色そのものは theme/variables.css の --member-color-N） */
export const MEMBER_COLOR_COUNT = 8

/**
 * ids の全員に色番号を割り当てる。既に色がある人はそのまま、ない人には使われていない色を若い順に割り当てる。
 * 色が足りないときは使っている人が一番少ない色を使う。
 */
export const assignColors = (ids: string[], existing: Record<string, number> = {}): Record<string, number> => {
  const result: Record<string, number> = {}
  const usage = Array<number>(MEMBER_COLOR_COUNT).fill(0)
  for (const id of ids) {
    const color = existing[id]
    if (color !== undefined) {
      result[id] = color
      usage[color]++
    }
  }
  for (const id of ids) {
    if (result[id] !== undefined) continue
    const color = usage.indexOf(Math.min(...usage))
    result[id] = color
    usage[color]++
  }
  return result
}
