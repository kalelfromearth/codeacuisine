import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { RecipeGeneratorService } from './recipe-generator.service';
import { RecipeRequestService } from './recipe-request.service';

/** Allows the loading page only when a recipe request exists, otherwise goes back to the start. */
export function requestAvailableGuard(): boolean | UrlTree {
  if (inject(RecipeRequestService).request() !== null) {
    return true;
  }
  return inject(Router).createUrlTree(['/generate-recipe']);
}

/** Allows the result pages only when recipes exist, otherwise goes back to the start. */
export function recipesAvailableGuard(): boolean | UrlTree {
  if (inject(RecipeGeneratorService).recipes().length > 0) {
    return true;
  }
  return inject(Router).createUrlTree(['/generate-recipe']);
}
