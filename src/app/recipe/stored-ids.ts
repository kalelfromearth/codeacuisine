/** Returns true for a usable id: a text that is not empty. */
export function isId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/** Reads a list of ids from the given browser storage. Anything unreadable gives an empty list. */
export function readStoredIds(storage: Storage, key: string): string[] {
  try {
    const ids: unknown = JSON.parse(storage.getItem(key) ?? '[]');
    return Array.isArray(ids) ? ids.filter(isId) : [];
  } catch {
    return [];
  }
}
