import { RecipeDiet } from '../../recipe/recipe.model';
import type { DietWordList } from './diet-words';

interface PreparedList {
  whole: Set<string>;
  prefix: string[];
  suffix: string[];
  contains: string[];
  allowed: string[];
  markers: string[];
}

interface PreparedLists {
  meatAndFish: PreparedList;
  animalProducts: PreparedList;
}

let preparedLists: PreparedLists | null = null;

/** Writes a text in lower case, without accents and with ae, oe, ue and ss instead of the umlauts and the sharp s. */
export function normalizeForDietCheck(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Returns all texts in the normalized form used by the diet check. */
function normalizeAll(texts: string[]): string[] {
  return texts.map(normalizeForDietCheck);
}

/** Returns the word list with all words normalized and the whole words as a set for fast lookup. */
function prepareList(list: DietWordList): PreparedList {
  return {
    whole: new Set(normalizeAll(list.whole)),
    prefix: normalizeAll(list.prefix),
    suffix: normalizeAll(list.suffix),
    contains: normalizeAll(list.contains),
    allowed: normalizeAll(list.allowed),
    markers: normalizeAll(list.markers),
  };
}

/** Loads the word lists on first use, prepares them and returns the prepared lists. */
async function loadLists(): Promise<PreparedLists> {
  if (!preparedLists) {
    const words = await import('./diet-words');
    preparedLists = {
      meatAndFish: prepareList(words.MEAT_AND_FISH),
      animalProducts: prepareList(words.ANIMAL_PRODUCTS),
    };
  }
  return preparedLists;
}

/** Returns the text without the allowed phrases, which are replaced by spaces. */
function removeAllowedPhrases(text: string, allowed: string[]): string {
  return allowed.reduce(function (rest, phrase) {
    return rest.split(phrase).join(' ');
  }, text);
}

/** Returns true when the token is a listed whole word or starts or ends with a listed part. */
function isTokenListed(token: string, list: PreparedList): boolean {
  return (
    list.whole.has(token) ||
    list.prefix.some(function (start) {
      return token.startsWith(start);
    }) ||
    list.suffix.some(function (end) {
      return token.endsWith(end);
    })
  );
}

/** Returns true when the text matches the list, unless it contains a marker that excludes it. */
function isListed(text: string, list: PreparedList): boolean {
  const isMarked = list.markers.some(function (marker) {
    return text.includes(marker);
  });
  if (isMarked) {
    return false;
  }
  const rest = removeAllowedPhrases(text, list.allowed);
  const hasListedToken = rest.split(/[^a-z]+/).some(function (token) {
    return token.length > 0 && isTokenListed(token, list);
  });
  return hasListedToken || list.contains.some(function (part) {
    return rest.includes(part);
  });
}

/** Returns true when the ingredient name does not fit the diet. */
function isUnsuitable(name: string, diet: RecipeDiet, lists: PreparedLists): boolean {
  const text = normalizeForDietCheck(name);
  if (isListed(text, lists.meatAndFish)) {
    return true;
  }
  return diet === 'vegan' && isListed(text, lists.animalProducts);
}

/** Returns the ingredients that do not fit the diet: meat and fish for Vegetarian, additionally milk, eggs and honey for Vegan. */
export async function findUnsuitableIngredients(names: string[], diet: RecipeDiet): Promise<string[]> {
  if (diet !== 'vegetarian' && diet !== 'vegan') {
    return [];
  }
  const lists = await loadLists();
  return names.filter(function (name) {
    return isUnsuitable(name, diet, lists);
  });
}

/** Writes a short message for the popup, for example "Tuna and ham do not fit a vegetarian diet." */
export function describeUnsuitableIngredients(names: string[], diet: RecipeDiet): string {
  const dietName = diet === 'vegan' ? 'a vegan' : 'a vegetarian';
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  return `${list} ${names.length > 1 ? 'do' : 'does'} not fit ${dietName} diet.`;
}
