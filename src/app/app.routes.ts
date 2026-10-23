import { Routes } from '@angular/router';
import { Landingpage } from './landingpage/landingpage';
import { GenerateRecipe } from './generate-recipe/generate-recipe';

export const routes: Routes = [
    { path : '' , component: Landingpage},
    { path : 'generate-recipe' , component: GenerateRecipe}
];
