/** 0 → A, 25 → Z, 26 → AA … と表計算ソフトの列名のように並べる */
const letterName = (index: number): string => {
  let name = ''
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name
  }
  return name
}

/** 名前を省略したときに付ける名前。A, B, C … のうちまだ使われていない最初のもの */
export const defaultMemberName = (usedNames: string[]): string => {
  const used = new Set(usedNames)
  for (let i = 0; ; i++) {
    const name = letterName(i)
    if (!used.has(name)) return name
  }
}
