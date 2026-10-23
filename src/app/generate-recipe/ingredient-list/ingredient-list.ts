import { Component, inject } from '@angular/core';
import { Ingredient, formatIngredientAmount } from '../ingredient.model';
import { IngredientListService, MIN_INGREDIENTS } from '../ingredient-list.service';

@Component({
  selector: 'app-ingredient-list',
  imports: [],
  templateUrl: './ingredient-list.html',
  styleUrl: './ingredient-list.scss',
})
export class IngredientList {
  private readonly ingredientList = inject(IngredientListService);

  readonly minIngredients = MIN_INGREDIENTS;
  readonly ingredients = this.ingredientList.ingredients;

  /** Returns the amount of an ingredient with a short unit, e.g. "100g". */
  formatAmount(ingredient: Ingredient): string {
    return formatIngredientAmount(ingredient);
  }

  /** Removes the ingredient at the given position from the shared list. */
  removeIngredient(position: number): void {
    this.ingredientList.removeIngredient(position);
  }
}
