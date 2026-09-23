// localStorage への保存。ストレージが使えない環境でも動くよう、失敗は握りつぶす
const KEY = 'weight-plate-calculator'
const VERSION = 1

export const loadState = <T>(): T | null => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.version === VERSION ? (parsed.state as T) : null
  } catch {
    return null
  }
}

export const saveState = <T>(state: T): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, state }))
  } catch {
    // 保存できなくても計算は続けられる
  }
}
