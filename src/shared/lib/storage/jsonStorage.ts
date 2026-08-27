export function loadJsonFromStorage<TValue>(storageKey: string): TValue | null {
  try {
    const serializedValue = localStorage.getItem(storageKey)

    if (!serializedValue) {
      return null
    }

    return JSON.parse(serializedValue) as TValue
  } catch {
    return null
  }
}

export function saveJsonToStorage<TValue>(storageKey: string, value: TValue): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value))
  } catch {
    return
  }
}
