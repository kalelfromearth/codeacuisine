import { Injectable, computed, signal } from '@angular/core';
import { Ingredient } from './ingredient.model';

export const MIN_INGREDIENTS = 3;
export const MAX_INGREDIENTS = 10;

@Injectable({ providedIn: 'root' })
export class IngredientListService {
  readonly ingredients = signal<Ingredient[]>([]);
  readonly isListFull = computed(() => this.ingredients().length >= MAX_INGREDIENTS);

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
}
