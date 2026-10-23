import { Routes } from '@angular/router';
import { Landingpage } from './landingpage/landingpage';
import { GenerateRecipe } from './generate-recipe/generate-recipe';
import { enoughIngredientsGuard } from './generate-recipe/enough-ingredients.guard';
import { Preferences } from './preferences/preferences';

export const routes: Routes = [
    { path : '' , component: Landingpage},
    { path : 'generate-recipe' , component: GenerateRecipe},
    { path : 'preferences' , component: Preferences, canActivate: [enoughIngredientsGuard]}
];
