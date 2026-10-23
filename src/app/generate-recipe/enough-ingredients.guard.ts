import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { IngredientListService, MIN_INGREDIENTS } from './ingredient-list.service';

/** Allows a route only with enough ingredients, otherwise redirects to the generate page. */
export function enoughIngredientsGuard(): boolean | UrlTree {
  const ingredientCount = inject(IngredientListService).ingredients().length;
  if (ingredientCount >= MIN_INGREDIENTS) {
    return true;
  }
  return inject(Router).createUrlTree(['/generate-recipe']);
}
