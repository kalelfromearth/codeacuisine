import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { IngredientListService } from '../generate-recipe/ingredient-list.service';
import {
  RECIPES_PAGE_SIZE,
  RecipePage,
  RecipePageCursor,
  RecipeSort,
  RecipeStoreService,
} from '../recipe/recipe-store.service';
import { FILM_CUISINE, FILM_RECIPES, FilmInfo, isFilmRecipe } from '../recipe/film-recipes';
import { RECIPE_CUISINES, Recipe, RecipeCuisine, buildRecipeTags, formatRecipeLabel } from '../recipe/recipe.model';
import { Header } from '../shared/header/header';
import { buildPageTitle } from '../shared/page-title';

type ListStatus = 'loading' | 'ready' | 'error' | 'missing';

// The header images of the cuisine lists. A cuisine without an entry gets a plain cream band with the title instead.
const CUISINE_HEADERS: Record<string, string> = {
  german: 'images/cookbook/header-german.svg',
  italian: 'images/cookbook/header-italian.webp',
  indian: 'images/cookbook/header-indian.svg',
  japanese: 'images/cookbook/header-japanese.svg',
  gourmet: 'images/cookbook/header-gourmet.svg',
  fusion: 'images/cookbook/header-fusion.svg',
  film: 'images/cookbook/header-film.svg',
};

function toPageNumber(_unused: unknown, index: number): number {
  return index + 1;
}

function findCuisine(name: string): RecipeCuisine | null {
  return RECIPE_CUISINES.find(function (cuisine) {
    return cuisine === name;
  }) ?? null;
}

@Component({
  selector: 'app-library-list',
  imports: [Header, RouterLink],
  templateUrl: './library-list.html',
  styleUrl: './library-list.scss',
})
export class LibraryList {
  private readonly recipeStore = inject(RecipeStoreService);
  private readonly ingredientList = inject(IngredientListService);
  private readonly pageTitle = inject(Title);
  private readonly pageCache = new Map<string, RecipePage>();

  /** The cuisine from the route, for example "italian". */
  readonly cuisine = input.required<string>();

  readonly sort = signal<RecipeSort>('likes');
  readonly pageNumber = signal(1);
  readonly page = signal<RecipePage | null>(null);
  readonly status = signal<ListStatus>('loading');
  /** The start marker of every page that is known so far. The first page starts at the beginning (null). */
  readonly pageStarts = signal<(RecipePageCursor | null)[]>([null]);

  readonly isFilm = computed(() => this.cuisine() === FILM_CUISINE);
  readonly headerImage = computed(() => CUISINE_HEADERS[this.cuisine()] ?? null);
  readonly knownCuisine = computed(() => findCuisine(this.cuisine()));
  readonly title = computed(() => this.buildTitle());
  readonly pageNumbers = computed(() => Array.from({ length: this.pageStarts().length }, toPageNumber));
  readonly firstRank = computed(() => (this.pageNumber() - 1) * RECIPES_PAGE_SIZE);
  readonly hasPreviousPage = computed(() => this.pageNumber() > 1);
  readonly hasNextPage = computed(() => this.pageStarts().length > this.pageNumber());
  readonly sortOptions: { value: RecipeSort; label: string }[] = [
    { value: 'likes', label: 'Most liked' },
    { value: 'newest', label: 'Newest' },
  ];

  constructor() {
    effect(this.loadCurrentPage.bind(this));
    effect(this.updatePageTitle.bind(this));
  }

  /** Shows the page with the given number. */
  goToPage(number: number): void {
    this.pageNumber.set(number);
  }

  /** Changes the sorting of the list and starts again at the first page. */
  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.pageStarts.set([null]);
    this.pageNumber.set(1);
    this.sort.set(value === 'newest' ? 'newest' : 'likes');
  }

  /** Returns the tags shown on the row of a recipe. */
  getTags(recipe: Recipe): string[] {
    return buildRecipeTags(recipe);
  }

  /** Returns the film of a recipe of the film cuisine, or null for all other recipes. */
  getFilm(recipe: Recipe): FilmInfo | null {
    return isFilmRecipe(recipe) ? recipe.film : null;
  }

  /** Forgets the old ingredients so the next recipe starts with an empty list. */
  startNewRecipe(): void {
    this.ingredientList.clearIngredients();
  }

  private updatePageTitle(): void {
    this.pageTitle.setTitle(buildPageTitle(this.status() === 'missing' ? 'Cuisine not found' : this.title()));
  }

  private buildTitle(): string {
    return this.isFilm() ? 'Film cuisine' : `${formatRecipeLabel(this.knownCuisine() ?? '')} cuisine`;
  }

  private showFilmRecipes(): void {
    this.page.set({ recipes: [...FILM_RECIPES], cursor: null, hasMore: false });
    this.status.set('ready');
    untracked(this.showFilmLikes.bind(this));
  }

  private async showFilmLikes(): Promise<void> {
    try {
      const likes = await this.recipeStore.loadFilmLikes();
      if (this.isFilm()) {
        const recipes = FILM_RECIPES.map(function (recipe) {
          return { ...recipe, likes: likes[recipe.id] ?? 0 };
        });
        this.page.set({ recipes, cursor: null, hasMore: false });
      }
    } catch {
      // Without the hearts the film recipes are still shown, with 0 hearts.
    }
  }

  private loadCurrentPage(): void {
    if (this.isFilm()) {
      this.showFilmRecipes();
      return;
    }
    const cuisine = this.knownCuisine();
    const sort = this.sort();
    const number = this.pageNumber();
    if (!cuisine) {
      this.status.set('missing');
      return;
    }
    untracked(this.showPage.bind(this, cuisine, sort, number));
  }

  private async showPage(cuisine: RecipeCuisine, sort: RecipeSort, number: number): Promise<void> {
    const key = `${cuisine}|${sort}|${number}`;
    const cachedPage = this.pageCache.get(key);
    if (cachedPage) {
      this.applyPage(cachedPage, number);
      return;
    }
    this.status.set('loading');
    try {
      const page = await this.recipeStore.loadCuisinePage(cuisine, sort, this.pageStarts()[number - 1] ?? null);
      this.pageCache.set(key, page);
      this.applyIfCurrent(page, cuisine, sort, number);
    } catch {
      this.status.set('error');
    }
  }

  private applyIfCurrent(page: RecipePage, cuisine: RecipeCuisine, sort: RecipeSort, number: number): void {
    if (this.knownCuisine() === cuisine && this.sort() === sort && this.pageNumber() === number) {
      this.applyPage(page, number);
    }
  }

  private applyPage(page: RecipePage, number: number): void {
    this.page.set(page);
    this.status.set('ready');
    if (page.hasMore) {
      this.pageStarts.update(function (starts) {
        return starts.length > number ? starts : [...starts, page.cursor];
      });
    }
  }
}
