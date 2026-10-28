import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IngredientListService } from '../generate-recipe/ingredient-list.service';
import { describeIngredientAmount } from '../generate-recipe/ingredient.model';
import { RecipeGeneratorService } from '../recipe/recipe-generator.service';
import { forgetLike, isRecipeLiked, rememberLike } from '../recipe/liked-recipes';
import { RecipeStoreService } from '../recipe/recipe-store.service';
import { Recipe, RecipeIngredient, formatRecipeLabel } from '../recipe/recipe.model';
import { Header } from '../shared/header/header';

type RecipeLoadStatus = 'loading' | 'ready' | 'missing' | 'error';
type LikeChange = 1 | -1;

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
  private readonly recipeStore = inject(RecipeStoreService);

  /** The Firestore id of the recipe from the route. */
  readonly id = input.required<string>();

  readonly recipe = signal<Recipe | null>(null);
  readonly status = signal<RecipeLoadStatus>('loading');
  readonly hasResults = computed(() => this.generator.recipes().length > 0);
  readonly failureText = computed(() => this.buildFailureText());
  readonly ownIngredients = computed(() => this.recipe()?.ingredients.filter(isOwnIngredient) ?? []);
  readonly extraIngredients = computed(() => this.recipe()?.ingredients.filter(isExtraIngredient) ?? []);
  readonly chefNumbers = computed(() => this.buildChefNumbers(this.recipe()?.cooks ?? 0));
  readonly tags = computed(() => this.buildTags());

  readonly showIngredients = signal(true);
  readonly showDirections = signal(true);
  readonly isLiked = signal(false);
  readonly likeCount = signal(0);
  private readonly isSavingLike = signal(false);

  constructor() {
    effect(this.showRecipe.bind(this));
  }

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

  /** Gives the recipe a heart or takes it back and saves the new number of likes. */
  async toggleLike(): Promise<void> {
    const recipe = this.recipe();
    if (!recipe || this.isSavingLike()) {
      return;
    }
    const wasLiked = this.isLiked();
    const previousCount = this.likeCount();
    const change: LikeChange = wasLiked ? -1 : 1;
    this.showLike(recipe.id, !wasLiked, Math.max(0, previousCount + change));
    this.isSavingLike.set(true);
    try {
      await this.recipeStore.changeLikes(recipe.id, change);
    } catch {
      this.showLike(recipe.id, wasLiked, previousCount);
    } finally {
      this.isSavingLike.set(false);
    }
  }

  /** Forgets the old ingredients so the next recipe starts with an empty list. */
  startNewRecipe(): void {
    this.ingredientList.clearIngredients();
  }

  private invert(value: boolean): boolean {
    return !value;
  }

  private showRecipe(): void {
    const id = this.id();
    untracked(this.openRecipe.bind(this, id));
  }

  private openRecipe(id: string): void {
    const knownRecipe = this.generator.recipes().find(function (recipe) {
      return recipe.id === id;
    });
    if (knownRecipe) {
      this.applyRecipe(knownRecipe);
      return;
    }
    this.status.set('loading');
    this.fetchRecipe(id);
  }

  private async fetchRecipe(id: string): Promise<void> {
    try {
      const loadedRecipe = await this.recipeStore.loadRecipe(id);
      if (this.id() === id) {
        this.applyRecipe(loadedRecipe);
      }
    } catch {
      this.status.set('error');
    }
  }

  private applyRecipe(recipe: Recipe | null): void {
    this.recipe.set(recipe);
    this.status.set(recipe ? 'ready' : 'missing');
    this.likeCount.set(recipe?.likes ?? 0);
    this.isLiked.set(recipe ? isRecipeLiked(recipe.id) : false);
  }

  private showLike(id: string, liked: boolean, count: number): void {
    this.isLiked.set(liked);
    this.likeCount.set(count);
    if (liked) {
      rememberLike(id);
    } else {
      forgetLike(id);
    }
    this.generator.setLikes(id, count);
  }

  private buildFailureText(): string {
    if (this.status() === 'error') {
      return 'We could not load this recipe. Please check your connection and try again.';
    }
    return 'We could not find this recipe. Maybe the link is not complete.';
  }

  private buildChefNumbers(cooks: number): number[] {
    return Array.from({ length: cooks }, function (_unused, index) {
      return index + 1;
    });
  }

  private buildTags(): string[] {
    const recipe = this.recipe();
    if (!recipe) {
      return [];
    }
    const dietTag = recipe.diet === 'none' ? [] : [formatRecipeLabel(recipe.diet)];
    return [...dietTag, formatRecipeLabel(recipe.timeCategory)];
  }
}
