import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IngredientListService } from '../generate-recipe/ingredient-list.service';
import { RecipeStoreService } from '../recipe/recipe-store.service';
import { RECIPE_CUISINES, Recipe, RecipeCuisine, buildRecipeTags, formatRecipeLabel } from '../recipe/recipe.model';
import { Header } from '../shared/header/header';

type LibraryStatus = 'loading' | 'ready' | 'error';
type Shelf = 'liked' | 'newest';

@Component({
  selector: 'app-library',
  imports: [Header, NgTemplateOutlet, RouterLink],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class Library {
  private readonly recipeStore = inject(RecipeStoreService);
  private readonly ingredientList = inject(IngredientListService);

  readonly cuisines = RECIPE_CUISINES;
  readonly mostLiked = signal<Recipe[]>([]);
  readonly newest = signal<Recipe[]>([]);
  readonly status = signal<LibraryStatus>('loading');
  readonly activeShelf = signal<Shelf>('liked');
  readonly shownRecipes = computed(() => (this.activeShelf() === 'liked' ? this.mostLiked() : this.newest()));

  constructor() {
    this.loadShelves();
  }

  /** Returns the name of a cuisine as shown on its tile, for example "Italian cuisine". */
  describeCuisine(cuisine: RecipeCuisine): string {
    return `${formatRecipeLabel(cuisine)} cuisine`;
  }

  /** Switches the row between the most liked and the newest recipes. */
  showShelf(shelf: Shelf): void {
    this.activeShelf.set(shelf);
  }

  /** Returns the tags shown on the card of a recipe. */
  getTags(recipe: Recipe): string[] {
    return buildRecipeTags(recipe);
  }

  /** Forgets the old ingredients so the next recipe starts with an empty list. */
  startNewRecipe(): void {
    this.ingredientList.clearIngredients();
  }

  private async loadShelves(): Promise<void> {
    try {
      const [mostLiked, newest] = await Promise.all([
        this.recipeStore.loadMostLiked(),
        this.recipeStore.loadNewest(),
      ]);
      this.mostLiked.set(mostLiked);
      this.newest.set(newest);
      this.status.set('ready');
    } catch {
      this.status.set('error');
    }
  }
}
