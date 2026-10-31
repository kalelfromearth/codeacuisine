import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Ingredient } from '../generate-recipe/ingredient.model';
import { IngredientListService, MIN_INGREDIENTS } from '../generate-recipe/ingredient-list.service';
import { describeUnsuitableIngredients, findUnsuitableIngredients } from './diet-check/diet-check';
import { RecipeGeneratorService } from '../recipe/recipe-generator.service';
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
import { Popup } from '../shared/popup/popup';
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
  imports: [Button, ChipGroup, Header, Popup, ReactiveFormsModule, RouterLink, Stepper],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
})
export class Preferences {
  private readonly ingredientList = inject(IngredientListService);
  private readonly recipeRequestService = inject(RecipeRequestService);
  private readonly recipeGenerator = inject(RecipeGeneratorService);
  private readonly router = inject(Router);

  readonly unsuitableIngredients = signal<string[]>([]);
  readonly isDietPopupOpen = computed(this.hasUnsuitableIngredients.bind(this));
  readonly dietMessage = computed(this.buildDietMessage.bind(this));
  readonly canContinueWithout = computed(this.hasEnoughSuitableIngredients.bind(this));

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

  /** Checks the ingredients against the diet, then starts the recipe request or opens the diet popup. */
  async generateRecipe(): Promise<void> {
    if (this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }
    const diet = this.preferencesForm.controls.diet.value;
    const names = this.ingredientList.ingredients().map(function (ingredient) {
      return ingredient.name;
    });
    const unsuitable = await findUnsuitableIngredients(names, diet);
    if (unsuitable.length === 0) {
      this.startGenerating(this.ingredientList.ingredients());
      return;
    }
    this.unsuitableIngredients.set(unsuitable);
  }

  /** Closes the diet popup so the preferences can be changed. */
  closeDietPopup(): void {
    this.unsuitableIngredients.set([]);
  }

  /** Starts the recipe request with only the ingredients that fit the diet. */
  continueWithoutUnsuitable(): void {
    const unsuitable = this.unsuitableIngredients();
    const suitable = this.ingredientList.ingredients().filter(function (ingredient) {
      return !unsuitable.includes(ingredient.name);
    });
    this.closeDietPopup();
    this.startGenerating(suitable);
  }

  private hasUnsuitableIngredients(): boolean {
    return this.unsuitableIngredients().length > 0;
  }

  private buildDietMessage(): string {
    return describeUnsuitableIngredients(this.unsuitableIngredients(), this.preferencesForm.controls.diet.value);
  }

  private hasEnoughSuitableIngredients(): boolean {
    return this.ingredientList.ingredients().length - this.unsuitableIngredients().length >= MIN_INGREDIENTS;
  }

  private startGenerating(ingredients: Ingredient[]): void {
    this.recipeRequestService.setRequest(this.buildRecipeRequest(ingredients));
    this.recipeGenerator.reset();
    this.router.navigateByUrl('/generating');
  }

  private buildRecipeRequest(ingredients: Ingredient[]): RecipeRequest {
    const preferences = this.preferencesForm.getRawValue();
    return {
      ingredients,
      servings: preferences.servings,
      cooks: preferences.cooks as CookCount,
      timeCategory: preferences.timeCategory,
      cuisine: preferences.cuisine,
      diet: preferences.diet,
    };
  }
}
