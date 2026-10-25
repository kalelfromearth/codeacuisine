import { AbstractControl, ValidationErrors } from '@angular/forms';

const VOWEL = 'aeiouyäöüáàâéèêíìîóòôúùû';
const HAS_VOWEL = new RegExp(`[${VOWEL}]`);
const REPEATED_LETTER = /(\p{L})\1{2,}/u;
const LONG_CONSONANT_RUN = new RegExp(`(?:(?![${VOWEL}])\\p{L}){6,}`, 'u');
const KEYBOARD_MASH = /sdf|dfg|fgh|ghj|hjk|jkl|xcv|cvb|vbn|qwe|yxc/;
const MIN_LETTERS = 2;
const MIN_LETTERS_FOR_VOWEL_CHECK = 3;

function splitIntoWords(name: string): string[] {
  return name.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
}

function isImplausibleWord(word: string): boolean {
  const withoutGermanClusters = word.replace(/tsch|sch/g, 's');
  const missesVowel = word.length >= MIN_LETTERS_FOR_VOWEL_CHECK && !HAS_VOWEL.test(word);
  return (
    missesVowel ||
    REPEATED_LETTER.test(word) ||
    LONG_CONSONANT_RUN.test(withoutGermanClusters) ||
    KEYBOARD_MASH.test(word)
  );
}

/** Returns false for keyboard mashing and other text that cannot be a food name. */
export function looksLikeIngredientName(name: string): boolean {
  const words = splitIntoWords(name);
  const letterCount = words.join('').length;
  return letterCount >= MIN_LETTERS && !words.some(isImplausibleWord);
}

/** Fails with an "implausibleName" error when the text does not look like an ingredient. */
export function plausibleIngredientName(control: AbstractControl): ValidationErrors | null {
  const name = String(control.value ?? '').trim();
  if (!name) {
    return null;
  }
  return looksLikeIngredientName(name) ? null : { implausibleName: true };
}
