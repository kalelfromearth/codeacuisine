import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { RecipeGeneratorService } from './recipe-generator.service';
import { RecipeRequestService } from './recipe-request.service';

/** Allows the loading page only when a recipe request exists, otherwise goes back to the start. */
export function requestAvailableGuard(): boolean | UrlTree {
  if (inject(RecipeRequestService).request() !== null) {
    return true;
  }
  return inject(Router).createUrlTree(['/generate-recipe']);
}

/** Allows a recipe page only for a number that exists, otherwise goes back to the results or the start. */
export function recipeNumberGuard(route: ActivatedRouteSnapshot): boolean | UrlTree {
  const recipes = inject(RecipeGeneratorService).recipes();
  const position = Number(route.paramMap.get('n')) - 1;
  if (Number.isInteger(position) && recipes[position] !== undefined) {
    return true;
  }
  return inject(Router).createUrlTree([recipes.length > 0 ? '/recipes' : '/generate-recipe']);
}

/** Allows the result pages only when recipes exist, otherwise goes back to the start. */
export function recipesAvailableGuard(): boolean | UrlTree {
  if (inject(RecipeGeneratorService).recipes().length > 0) {
    return true;
  }
  return inject(Router).createUrlTree(['/generate-recipe']);
}
