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

/** Allows the result page when recipes exist or can be restored after a reload, otherwise goes back to the start. */
export async function recipesAvailableGuard(): Promise<boolean | UrlTree> {
  const generator = inject(RecipeGeneratorService);
  const router = inject(Router);
  if (generator.recipes().length > 0 || (await generator.restoreResults())) {
    return true;
  }
  return router.createUrlTree(['/generate-recipe']);
}
