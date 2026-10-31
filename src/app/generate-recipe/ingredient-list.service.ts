import { Injectable, computed, effect, signal } from '@angular/core';
import { Ingredient, MAX_AMOUNT_BY_UNIT } from './ingredient.model';

export const MIN_INGREDIENTS = 3;
export const MAX_INGREDIENTS = 10;

const INGREDIENTS_KEY = 'codeacuisine.ingredients';

function isIngredient(value: unknown): value is Ingredient {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const { name, amount, unit } = value as Record<string, unknown>;
  const maxAmount = MAX_AMOUNT_BY_UNIT[unit as Ingredient['unit']];
  return typeof name === 'string' && name.trim().length > 0 && Number.isInteger(amount)
    && maxAmount !== undefined && (amount as number) >= 1 && (amount as number) <= maxAmount;
}

// The list survives a reload of the page in the same tab, but is gone when the tab is closed.
function readSavedIngredients(): Ingredient[] {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(INGREDIENTS_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter(isIngredient).slice(0, MAX_INGREDIENTS) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class IngredientListService {
  readonly ingredients = signal<Ingredient[]>(readSavedIngredients());
  readonly isListFull = computed(() => this.ingredients().length >= MAX_INGREDIENTS);

  constructor() {
    effect(this.saveIngredients.bind(this));
  }

  /** Appends an ingredient to the list unless the maximum is already reached. */
  addIngredient(ingredient: Ingredient): void {
    if (this.isListFull()) {
      return;
    }
    this.ingredients.update(function (currentList) {
      return [...currentList, ingredient];
    });
  }

  /** Replaces the ingredient at the given position with the changed one. */
  updateIngredient(position: number, changedIngredient: Ingredient): void {
    this.ingredients.update(function (currentList) {
      return currentList.map(function (ingredient, currentPosition) {
        return currentPosition === position ? changedIngredient : ingredient;
      });
    });
  }

  /** Empties the whole list so a new recipe can start from scratch. */
  clearIngredients(): void {
    this.ingredients.set([]);
  }

  /** Removes the ingredient at the given position from the list. */
  removeIngredient(position: number): void {
    this.ingredients.update(function (currentList) {
      return currentList.filter(function (_ingredient, currentPosition) {
        return currentPosition !== position;
      });
    });
  }

  private saveIngredients(): void {
    const ingredients = this.ingredients();
    try {
      sessionStorage.setItem(INGREDIENTS_KEY, JSON.stringify(ingredients));
    } catch {
      // Without storage the list is simply empty again after a reload.
    }
  }
}
