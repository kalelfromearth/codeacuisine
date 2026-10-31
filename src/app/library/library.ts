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
const RECIPE_PATH = /^\/recipes\/[A-Za-z0-9-]+$/;

// The results page and a recipe page pass their address along when they open the cookbook. Any other address leads to the start page.
function readBackLink(): BackLink {
  const state = history.state as { backTo?: unknown } | null;
  const origin = typeof state?.backTo === 'string' ? state.backTo : '';
  if (origin === RESULTS_PATH) {
    return { path: RESULTS_PATH, label: 'the recipe results' };
  }
  return RECIPE_PATH.test(origin) ? { path: origin, label: 'the recipe' } : { path: '/', label: 'the start page' };
}

interface CuisinePhoto {
  src: string;
  width: number;
  height: number;
}

function squarePhoto(cuisine: string): CuisinePhoto {
  return { src: `images/cookbook/${cuisine}.webp`, width: 800, height: 800 };
}

// The photos of the cuisine tiles. A cuisine without an entry shows a coloured placeholder instead.
const CUISINE_PHOTOS: Record<string, CuisinePhoto> = {
  german: squarePhoto('german'),
  italian: squarePhoto('italian'),
  indian: squarePhoto('indian'),
  japanese: squarePhoto('japanese'),
  gourmet: squarePhoto('gourmet'),
  fusion: squarePhoto('fusion'),
  film: squarePhoto('film'),
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
  getPhoto(cuisine: string): CuisinePhoto | null {
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
