const RESULT_IDS_KEY = 'codeacuisine.resultIds';

/** Remembers the ids of the current results in this browser tab, so a reload can show them again. */
export function rememberResultIds(ids: string[]): void {
  try {
    sessionStorage.setItem(RESULT_IDS_KEY, JSON.stringify(ids));
  } catch {
    // Without storage the results are simply gone after a reload.
  }
}

/** Returns the remembered result ids, or an empty list when there are none. */
export function readResultIds(): string[] {
  try {
    const ids: unknown = JSON.parse(sessionStorage.getItem(RESULT_IDS_KEY) ?? '[]');
    return Array.isArray(ids) ? ids.filter(isId) : [];
  } catch {
    return [];
  }
}

/** Forgets the remembered result ids. */
export function forgetResultIds(): void {
  try {
    sessionStorage.removeItem(RESULT_IDS_KEY);
  } catch {
    // Nothing to forget without storage.
  }
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
