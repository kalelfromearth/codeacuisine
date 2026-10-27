import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IngredientListService } from '../generate-recipe/ingredient-list.service';
import { describeIngredientAmount } from '../generate-recipe/ingredient.model';
import { RecipeGeneratorService } from '../recipe/recipe-generator.service';
import { RecipeIngredient, formatRecipeLabel } from '../recipe/recipe.model';
import { Header } from '../shared/header/header';

function isOwnIngredient(ingredient: RecipeIngredient): boolean {
  return !ingredient.isExtra;
}

function isExtraIngredient(ingredient: RecipeIngredient): boolean {
  return ingredient.isExtra;
}

@Component({
  selector: 'app-recipe-detail',
  imports: [Header, RouterLink],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail {
  private readonly generator = inject(RecipeGeneratorService);
  private readonly ingredientList = inject(IngredientListService);

  /** The recipe number from the route, starting at 1. */
  readonly n = input.required<string>();

  readonly recipe = computed(() => this.generator.recipes()[Number(this.n()) - 1]);
  readonly ownIngredients = computed(() => this.recipe().ingredients.filter(isOwnIngredient));
  readonly extraIngredients = computed(() => this.recipe().ingredients.filter(isExtraIngredient));
  readonly chefNumbers = computed(() => this.buildChefNumbers(this.recipe().cooks));
  readonly tags = computed(() => this.buildTags());

  readonly showIngredients = signal(true);
  readonly showDirections = signal(true);
  readonly isLiked = signal(false);

  /** Returns the amount of an ingredient for reading, for example "80g" or "2 pieces". */
  describeAmount(ingredient: RecipeIngredient): string {
    return describeIngredientAmount(ingredient);
  }

  /** Opens or closes the ingredients on small screens. */
  toggleIngredients(): void {
    this.showIngredients.update(this.invert);
  }

  /** Opens or closes the directions on small screens. */
  toggleDirections(): void {
    this.showDirections.update(this.invert);
  }

  /** Gives the recipe a heart or takes it back. */
  toggleLike(): void {
    this.isLiked.update(this.invert);
  }

  /** Forgets the old ingredients so the next recipe starts with an empty list. */
  startNewRecipe(): void {
    this.ingredientList.clearIngredients();
  }

  private invert(value: boolean): boolean {
    return !value;
  }

  private buildChefNumbers(cooks: number): number[] {
    return Array.from({ length: cooks }, function (_unused, index) {
      return index + 1;
    });
  }

  private buildTags(): string[] {
    const recipe = this.recipe();
    const dietTag = recipe.diet === 'none' ? [] : [formatRecipeLabel(recipe.diet)];
    return [...dietTag, formatRecipeLabel(recipe.timeCategory)];
  }
}
