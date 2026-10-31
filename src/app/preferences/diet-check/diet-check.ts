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

function normalizeAll(texts: string[]): string[] {
  return texts.map(normalizeForDietCheck);
}

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

function removeAllowedPhrases(text: string, allowed: string[]): string {
  return allowed.reduce(function (rest, phrase) {
    return rest.split(phrase).join(' ');
  }, text);
}

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
