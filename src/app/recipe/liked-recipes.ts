const LIKED_IDS_KEY = 'codeacuisine.likedRecipeIds';

function readLikedIds(): string[] {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(LIKED_IDS_KEY) ?? '[]');
    return Array.isArray(ids) ? ids.filter(isId) : [];
  } catch {
    return [];
  }
}

function writeLikedIds(ids: string[]): void {
  try {
    localStorage.setItem(LIKED_IDS_KEY, JSON.stringify(ids));
  } catch {
    // Without storage the heart is simply empty again after a reload.
  }
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/** Returns true when this browser has already given the recipe a heart. */
export function isRecipeLiked(id: string): boolean {
  return readLikedIds().includes(id);
}

/** Remembers in this browser that the recipe got a heart. */
export function rememberLike(id: string): void {
  const ids = readLikedIds().filter(function (likedId) {
    return likedId !== id;
  });
  writeLikedIds([...ids, id]);
}

/** Forgets the heart of the recipe in this browser. */
export function forgetLike(id: string): void {
  writeLikedIds(
    readLikedIds().filter(function (likedId) {
      return likedId !== id;
    }),
  );
}
