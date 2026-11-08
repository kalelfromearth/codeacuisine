/** The entries of one page and the information whether there is a page after it. */
export interface CutPage<T> {
  shown: T[];
  hasMore: boolean;
}

/**
 * Cuts the answer of a query that asked for one entry more than a page holds.
 * The extra entry is never shown, it only tells that a next page exists, so no empty page is ever offered.
 */
export function cutPage<T>(entries: T[], pageSize: number): CutPage<T> {
  return { shown: entries.slice(0, pageSize), hasMore: entries.length > pageSize };
}
