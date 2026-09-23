/** 色番号を --member-color に入れる。子要素は var(--member-color) で使う */
export const memberColorStyle = (color: number | undefined) => ({
  '--member-color': `var(--member-color-${color ?? 0})`,
})
