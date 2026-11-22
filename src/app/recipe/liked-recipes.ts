import { readStoredIds } from './stored-ids';

const LIKED_IDS_KEY = 'codeacuisine.likedRecipeIds';

/** Returns the ids of the recipes this browser has given a heart. */
function readLikedIds(): string[] {
  return readStoredIds(localStorage, LIKED_IDS_KEY);
}

/** Stores the ids of the liked recipes in this browser. */
function writeLikedIds(ids: string[]): void {
  try {
    localStorage.setItem(LIKED_IDS_KEY, JSON.stringify(ids));
  } catch {
    // Without storage the heart is simply empty again after a reload.
  }
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
