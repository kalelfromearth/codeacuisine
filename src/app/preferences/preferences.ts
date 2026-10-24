import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IngredientListService } from '../generate-recipe/ingredient-list.service';
import { RecipeRequestService } from '../recipe/recipe-request.service';
import {
  CookCount,
  MAX_COOKS,
  MAX_SERVINGS,
  MIN_COOKS,
  MIN_SERVINGS,
  RecipeCuisine,
  RecipeDiet,
  RecipeRequest,
  RecipeTimeCategory,
} from '../recipe/recipe.model';
import { Button } from '../shared/button/button';
import { ChipGroup, ChipOption } from '../shared/chip-group/chip-group';
import { Header } from '../shared/header/header';
import { Stepper } from '../shared/stepper/stepper';

type PreferencesFormControls = {
  servings: FormControl<number>;
  cooks: FormControl<number>;
  timeCategory: FormControl<RecipeTimeCategory>;
  cuisine: FormControl<RecipeCuisine>;
  diet: FormControl<RecipeDiet>;
};

@Component({
  selector: 'app-preferences',
  imports: [Button, ChipGroup, Header, ReactiveFormsModule, RouterLink, Stepper],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
})
export class Preferences {
  private readonly ingredientList = inject(IngredientListService);
  private readonly recipeRequestService = inject(RecipeRequestService);

  readonly minServings = MIN_SERVINGS;
  readonly maxServings = MAX_SERVINGS;
  readonly minCooks = MIN_COOKS;
  readonly maxCooks = MAX_COOKS;

  readonly timeOptions: readonly ChipOption<RecipeTimeCategory>[] = [
    { value: 'quick', label: 'Quick', hint: 'up to 20min' },
    { value: 'medium', label: 'Medium', hint: '25-40min' },
    { value: 'complex', label: 'Complex', hint: 'over 45min' },
  ];

  readonly cuisineOptions: readonly ChipOption<RecipeCuisine>[] = [
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'indian', label: 'Indian' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'gourmet', label: 'Gourmet' },
    { value: 'fusion', label: 'Fusion' },
  ];

  readonly dietOptions: readonly ChipOption<RecipeDiet>[] = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'none', label: 'No preferences' },
  ];

  readonly preferencesForm: FormGroup<PreferencesFormControls> = new FormGroup<PreferencesFormControls>({
    servings: new FormControl(2, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(MIN_SERVINGS), Validators.max(MAX_SERVINGS)],
    }),
    cooks: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(MIN_COOKS), Validators.max(MAX_COOKS)],
    }),
    timeCategory: new FormControl<RecipeTimeCategory>('quick', { nonNullable: true }),
    cuisine: new FormControl<RecipeCuisine>('italian', { nonNullable: true }),
    diet: new FormControl<RecipeDiet>('vegetarian', { nonNullable: true }),
  });

  /** Builds the recipe request from the ingredients and preferences and stores it for the next step. */
  generateRecipe(): void {
    if (this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }
    this.recipeRequestService.setRequest(this.buildRecipeRequest());
  }

  private buildRecipeRequest(): RecipeRequest {
    const preferences = this.preferencesForm.getRawValue();
    return {
      ingredients: this.ingredientList.ingredients(),
      servings: preferences.servings,
      cooks: preferences.cooks as CookCount,
      timeCategory: preferences.timeCategory,
      cuisine: preferences.cuisine,
      diet: preferences.diet,
    };
  }
}
