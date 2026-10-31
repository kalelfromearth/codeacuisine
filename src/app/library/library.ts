import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IngredientListService } from '../generate-recipe/ingredient-list.service';
import { RecipeStoreService } from '../recipe/recipe-store.service';
import { FILM_CUISINE } from '../recipe/film-recipes';
import { RECIPE_CUISINES, Recipe, buildRecipeTags, formatRecipeLabel } from '../recipe/recipe.model';
import { Header } from '../shared/header/header';

type LibraryStatus = 'loading' | 'ready' | 'error';
type Shelf = 'liked' | 'newest';

interface BackLink {
  path: string;
  label: string;
}

const RESULTS_PATH = '/recipes';

// The results page passes its address along when it opens the cookbook. Any other address leads to the start page.
function readBackLink(): BackLink {
  const state = history.state as { backTo?: unknown } | null;
  return state?.backTo === RESULTS_PATH
    ? { path: RESULTS_PATH, label: 'the recipe results' }
    : { path: '/', label: 'the start page' };
}

// The photos of the cuisine tiles. A cuisine without an entry shows a coloured placeholder instead.
const CUISINE_PHOTOS: Record<string, string> = {
  german: 'images/cookbook/german.webp',
  italian: 'images/cookbook/italian.webp',
};

@Component({
  selector: 'app-library',
  imports: [Header, NgTemplateOutlet, RouterLink],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class Library {
  private readonly recipeStore = inject(RecipeStoreService);
  private readonly ingredientList = inject(IngredientListService);

  readonly filmCuisine = FILM_CUISINE;
  readonly cuisines: readonly string[] = [...RECIPE_CUISINES, FILM_CUISINE];
  readonly mostLiked = signal<Recipe[]>([]);
  readonly newest = signal<Recipe[]>([]);
  readonly status = signal<LibraryStatus>('loading');
  readonly back = signal<BackLink>(readBackLink());
  readonly activeShelf = signal<Shelf>('liked');
  readonly shownRecipes = computed(() => (this.activeShelf() === 'liked' ? this.mostLiked() : this.newest()));

  constructor() {
    this.loadShelves();
  }

  /** Returns the photo of a cuisine for its tile, or null while there is no photo yet. */
  getPhoto(cuisine: string): string | null {
    return CUISINE_PHOTOS[cuisine] ?? null;
  }

  /** Returns the name of a cuisine as shown on its tile, for example "Italian cuisine". */
  describeCuisine(cuisine: string): string {
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
