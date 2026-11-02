function capitalizeWordStart(_match: string, separator: string, letter: string): string {
  return separator + letter.toUpperCase();
}

/** Writes every word of an ingredient name with a capital first letter, for example "rote bete" as "Rote Bete". */
export function capitalizeIngredientName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').replace(/(^|[\s-])(\p{L})/gu, capitalizeWordStart);
}
