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

  /** Removes the ingredient at the given position from the list. */
  removeIngredient(position: number): void {
    this.ingredients.update(function (currentList) {
      return currentList.filter(function (_ingredient, currentPosition) {
        return currentPosition !== position;
      });
    });
  }
}
