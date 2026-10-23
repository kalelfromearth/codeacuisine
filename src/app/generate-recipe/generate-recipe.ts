import { Component } from '@angular/core';
import { Header } from '../shared/header/header';
import { IngredientForm } from './ingredient-form/ingredient-form';

@Component({
  selector: 'app-generate-recipe',
  imports: [Header, IngredientForm],
  templateUrl: './generate-recipe.html',
  styleUrl: './generate-recipe.scss',
})
export class GenerateRecipe {}
