import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, Injector, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
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

const DRAG_START_DISTANCE_PX = 6;
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
  host: { '(window:resize)': 'refreshShelfEdges()' },
})
export class Library {
  private readonly recipeStore = inject(RecipeStoreService);
  private readonly ingredientList = inject(IngredientListService);
  private readonly injector = inject(Injector);
  private readonly shelfList = viewChild<ElementRef<HTMLElement>>('shelfList');

  readonly filmCuisine = FILM_CUISINE;
  readonly cuisines: readonly string[] = [...RECIPE_CUISINES, FILM_CUISINE];
  readonly mostLiked = signal<Recipe[]>([]);
  readonly newest = signal<Recipe[]>([]);
  readonly status = signal<LibraryStatus>('loading');
  readonly back = signal<BackLink>(readBackLink());
  readonly activeShelf = signal<Shelf>('liked');
  readonly shownRecipes = computed(() => (this.activeShelf() === 'liked' ? this.mostLiked() : this.newest()));

  readonly isDragging = signal(false);
  private isMousePressed = false;
  private dragStartX = 0;
  private dragStartScroll = 0;
  readonly canScrollBack = signal(false);
  readonly canScrollForward = signal(false);

  constructor() {
    this.loadShelves();
    effect(this.refreshAfterShelfChange.bind(this));
  }

  /** Scrolls the recipe row by about one screen to the left (-1) or to the right (1). */
  scrollShelf(direction: -1 | 1): void {
    const list = this.shelfList()?.nativeElement;
    if (!list) {
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /** Starts dragging the recipe row with the left mouse button. A finger just swipes, so touch is ignored. */
  startShelfDrag(event: PointerEvent, list: HTMLElement): void {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return;
    }
    this.isMousePressed = true;
    this.dragStartX = event.clientX;
    this.dragStartScroll = list.scrollLeft;
  }

  /** Moves the recipe row with the mouse. Only a real drag captures the pointer, so a plain click still opens the card. */
  moveShelfDrag(event: PointerEvent, list: HTMLElement): void {
    if (!this.isMousePressed || event.buttons === 0) {
      this.endShelfDrag();
      return;
    }
    const distance = event.clientX - this.dragStartX;
    if (!this.isDragging() && Math.abs(distance) > DRAG_START_DISTANCE_PX) {
      this.isDragging.set(true);
      list.setPointerCapture(event.pointerId);
    }
    if (this.isDragging()) {
      list.scrollLeft = this.dragStartScroll - distance;
    }
  }

  /** Ends the mouse drag of the recipe row. */
  endShelfDrag(): void {
    this.isMousePressed = false;
    this.isDragging.set(false);
  }

  /** Checks whether the recipe row has more cards on the left or on the right and updates the arrows. */
  refreshShelfEdges(): void {
    const list = this.shelfList()?.nativeElement;
    if (!list) {
      return;
    }
    this.canScrollBack.set(list.scrollLeft > 1);
    this.canScrollForward.set(list.scrollLeft + list.clientWidth < list.scrollWidth - 1);
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

  private refreshAfterShelfChange(): void {
    this.shownRecipes();
    afterNextRender(this.refreshShelfEdges.bind(this), { injector: this.injector });
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
