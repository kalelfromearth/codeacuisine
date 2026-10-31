import { Routes } from '@angular/router';
import { Landingpage } from './landingpage/landingpage';
import { GenerateRecipe } from './generate-recipe/generate-recipe';
import { enoughIngredientsGuard } from './generate-recipe/enough-ingredients.guard';
import { Preferences } from './preferences/preferences';
import { Generating } from './generating/generating';
import { Recipes } from './recipes/recipes';
import { recipesAvailableGuard, requestAvailableGuard } from './recipe/recipe.guards';
import { APP_NAME, buildPageTitle } from './shared/page-title';

// The recipe detail and the cookbook pages are loaded when they are opened, to keep the first download small.
// The recipe detail and the cuisine list set their own title, because it depends on the loaded recipe or cuisine.
export const routes: Routes = [
    { path : '' , component: Landingpage, title: `${APP_NAME} – AI recipe generator`},
    { path : 'generate-recipe' , component: GenerateRecipe, title: buildPageTitle('Your ingredients')},
    { path : 'preferences' , component: Preferences, canActivate: [enoughIngredientsGuard], title: buildPageTitle('Your preferences')},
    { path : 'generating' , component: Generating, canActivate: [requestAvailableGuard], title: buildPageTitle('Creating your recipes')},
    { path : 'recipes' , component: Recipes, canActivate: [recipesAvailableGuard], title: buildPageTitle('Your recipes')},
    { path : 'recipes/:id' , loadComponent: () => import('./recipe-detail/recipe-detail').then(page => page.RecipeDetail)},
    { path : 'library' , loadComponent: () => import('./library/library').then(page => page.Library), title: buildPageTitle('Cookbook')},
    { path : 'library/:cuisine' , loadComponent: () => import('./library-list/library-list').then(page => page.LibraryList)},
    { path : '**' , loadComponent: () => import('./not-found/not-found').then(page => page.NotFound), title: buildPageTitle('Page not found')}
];
