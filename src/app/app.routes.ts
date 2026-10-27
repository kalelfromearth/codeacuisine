import { Routes } from '@angular/router';
import { Landingpage } from './landingpage/landingpage';
import { GenerateRecipe } from './generate-recipe/generate-recipe';
import { enoughIngredientsGuard } from './generate-recipe/enough-ingredients.guard';
import { Preferences } from './preferences/preferences';
import { Generating } from './generating/generating';
import { Recipes } from './recipes/recipes';
import { RecipeDetail } from './recipe-detail/recipe-detail';
import { recipeNumberGuard, recipesAvailableGuard, requestAvailableGuard } from './recipe/recipe.guards';

export const routes: Routes = [
    { path : '' , component: Landingpage},
    { path : 'generate-recipe' , component: GenerateRecipe},
    { path : 'preferences' , component: Preferences, canActivate: [enoughIngredientsGuard]},
    { path : 'generating' , component: Generating, canActivate: [requestAvailableGuard]},
    { path : 'recipes' , component: Recipes, canActivate: [recipesAvailableGuard]},
    { path : 'recipes/:n' , component: RecipeDetail, canActivate: [recipeNumberGuard]}
];
