import { Routes } from '@angular/router';
import { Landingpage } from './landingpage/landingpage';
import { GenerateRecipe } from './generate-recipe/generate-recipe';
import { enoughIngredientsGuard } from './generate-recipe/enough-ingredients.guard';
import { Preferences } from './preferences/preferences';
import { Generating } from './generating/generating';
import { Recipes } from './recipes/recipes';
import { recipesAvailableGuard, requestAvailableGuard } from './recipe/recipe.guards';

// The recipe detail and the cookbook pages are loaded when they are opened, to keep the first download small.
export const routes: Routes = [
    { path : '' , component: Landingpage},
    { path : 'generate-recipe' , component: GenerateRecipe},
    { path : 'preferences' , component: Preferences, canActivate: [enoughIngredientsGuard]},
    { path : 'generating' , component: Generating, canActivate: [requestAvailableGuard]},
    { path : 'recipes' , component: Recipes, canActivate: [recipesAvailableGuard]},
    { path : 'recipes/:id' , loadComponent: () => import('./recipe-detail/recipe-detail').then(page => page.RecipeDetail)},
    { path : 'library' , loadComponent: () => import('./library/library').then(page => page.Library)},
    { path : 'library/:cuisine' , loadComponent: () => import('./library-list/library-list').then(page => page.LibraryList)}
];
