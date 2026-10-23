import { Component } from '@angular/core';
import { Header } from '../shared/header/header';
import { IngredientForm } from './ingredient-form/ingredient-form';
import { IngredientList } from './ingredient-list/ingredient-list';

@Component({
  selector: 'app-generate-recipe',
  imports: [Header, IngredientForm, IngredientList],
  templateUrl: './generate-recipe.html',
  styleUrl: './generate-recipe.scss',
})
export class GenerateRecipe {}
