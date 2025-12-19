export const clearEmptyValues = <T extends Record<string, unknown>>(data: T) => {
  const entries = Object.entries(data).filter(([_, value]) => value !== undefined) as [
    keyof T,
    T[keyof T],
  ][]

  return Object.fromEntries(entries) as {
    [K in keyof T as T[K] extends undefined ? never : K]: T[K]
  }
}
