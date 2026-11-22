import { ApplicationRef, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { IngredientListService } from '../generate-recipe/ingredient-list.service';
import { describeIngredientAmount } from '../generate-recipe/ingredient.model';
import { RecipeGeneratorService } from '../recipe/recipe-generator.service';
import { FilmInfo, findFilmRecipe, isFilmRecipe } from '../recipe/film-recipes';
import { forgetLike, isRecipeLiked, rememberLike } from '../recipe/liked-recipes';
import { RecipeStoreService } from '../recipe/recipe-store.service';
import { Recipe, RecipeIngredient, buildRecipeTags } from '../recipe/recipe.model';
import { BackLink } from '../shared/back-link';
import { Header } from '../shared/header/header';
import { buildPageTitle } from '../shared/page-title';
import { QrCode, createQrCode } from './recipe-print/qr-code';
import { PrintMode, RecipePrint } from './recipe-print/recipe-print';

type RecipeLoadStatus = 'loading' | 'ready' | 'missing' | 'error';
type LikeChange = 1 | -1;

/** Returns the link back to the cuisine list when the visitor came from there, otherwise null. */
// The cuisine list passes its address along when a recipe is opened. Only cookbook addresses are accepted.
function readListBackLink(): BackLink | null {
  const state = history.state as { backTo?: unknown; backLabel?: unknown } | null;
  if (typeof state?.backTo === 'string' && state.backTo.startsWith('/library/') && typeof state.backLabel === 'string') {
    return { path: state.backTo, label: state.backLabel };
  }
  return null;
}

/** Returns true when the ingredient comes from the visitor's own list. */
function isOwnIngredient(ingredient: RecipeIngredient): boolean {
  return !ingredient.isExtra;
}

/** Returns true when the ingredient was added by the recipe and is not on the visitor's list. */
function isExtraIngredient(ingredient: RecipeIngredient): boolean {
  return ingredient.isExtra;
}

@Component({
  selector: 'app-recipe-detail',
  imports: [Header, RecipePrint, RouterLink],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail {
  private readonly generator = inject(RecipeGeneratorService);
  private readonly ingredientList = inject(IngredientListService);
  private readonly recipeStore = inject(RecipeStoreService);
  private readonly pageTitle = inject(Title);
  private readonly appRef = inject(ApplicationRef);

  /** The Firestore id of the recipe from the route. */
  readonly id = input.required<string>();

  readonly recipe = signal<Recipe | null>(null);
  readonly status = signal<RecipeLoadStatus>('loading');
  readonly hasResults = computed(() => this.generator.recipes().length > 0);
  readonly film = computed(() => this.findFilm());
  readonly listBack: BackLink | null = readListBackLink();
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

  readonly printMode = signal<PrintMode>('recipe');
  readonly qrCode = signal<QrCode | null>(null);
  readonly recipeUrl = computed(() => new URL(`recipes/${this.id()}`, document.baseURI).href);

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
    await this.saveLike(recipe.id, change, wasLiked, previousCount);
  }

  /** Opens the print dialog of the browser with the recipe card, which can also be saved as a PDF there. */
  printRecipe(): Promise<void> {
    return this.startPrinting('recipe');
  }

  /** Opens the print dialog of the browser with only the shopping list of the extra ingredients. */
  printShoppingList(): Promise<void> {
    return this.startPrinting('shopping');
  }

  /** Forgets the old ingredients so the next recipe starts with an empty list. */
  startNewRecipe(): void {
    this.ingredientList.clearIngredients();
  }

  /** Shows the print card in the given mode, prepares the QR code and opens the print dialog. */
  // The card must be on the page before the dialog opens, so the change is drawn at once and not on the next frame.
  private async startPrinting(mode: PrintMode): Promise<void> {
    this.printMode.set(mode);
    await this.prepareQrCode();
    this.appRef.tick();
    window.print();
  }

  /** Creates the QR code of the recipe address once, if it does not exist yet. */
  private async prepareQrCode(): Promise<void> {
    if (this.qrCode()) {
      return;
    }
    try {
      this.qrCode.set(await createQrCode(this.recipeUrl()));
    } catch {
      // Without the code the card still shows the address as text.
    }
  }

  /** Returns the opposite of the given boolean value. */
  private invert(value: boolean): boolean {
    return !value;
  }

  /** Opens the recipe of the current address without tracking the signals it reads. */
  private showRecipe(): void {
    const id = this.id();
    untracked(this.openRecipe.bind(this, id));
  }

  /** Saves the changed likes and shows the old state again when saving fails. */
  private async saveLike(id: string, change: LikeChange, wasLiked: boolean, previousCount: number): Promise<void> {
    this.isSavingLike.set(true);
    try {
      await this.recipeStore.changeLikes(id, change);
    } catch {
      this.showLike(id, wasLiked, previousCount);
    } finally {
      this.isSavingLike.set(false);
    }
  }

  /** Returns the film information of the shown recipe, or null when it is not a film recipe. */
  private findFilm(): FilmInfo | null {
    const recipe = this.recipe();
    return recipe && isFilmRecipe(recipe) ? recipe.film : null;
  }

  /** Shows the recipe from the film recipes or the results when known, otherwise fetches it from the store. */
  private openRecipe(id: string): void {
    const knownRecipe =
      findFilmRecipe(id) ??
      this.generator.recipes().find(function (recipe) {
        return recipe.id === id;
      });
    if (knownRecipe) {
      this.applyRecipe(knownRecipe);
      return;
    }
    this.status.set('loading');
    this.fetchRecipe(id);
  }

  /** Loads the recipe from the store and shows it, or shows the error state when loading fails. */
  private async fetchRecipe(id: string): Promise<void> {
    try {
      const loadedRecipe = await this.recipeStore.loadRecipe(id);
      if (this.id() === id) {
        this.applyRecipe(loadedRecipe);
      }
    } catch {
      this.status.set('error');
      this.pageTitle.setTitle(buildPageTitle('Recipe not available'));
    }
  }

  /** Shows the recipe with its title, hearts and heart state, or the missing state when it is null. */
  private applyRecipe(recipe: Recipe | null): void {
    this.recipe.set(recipe);
    this.status.set(recipe ? 'ready' : 'missing');
    this.pageTitle.setTitle(buildPageTitle(recipe ? recipe.title : 'Recipe not available'));
    this.likeCount.set(recipe?.likes ?? 0);
    this.isLiked.set(recipe ? isRecipeLiked(recipe.id) : false);
    if (recipe && isFilmRecipe(recipe)) {
      this.loadFilmLikes(recipe.id);
    }
  }

  /** Loads the hearts of a film recipe and shows them unless the recipe changed or a heart is being saved. */
  private async loadFilmLikes(id: string): Promise<void> {
    try {
      const count = await this.recipeStore.loadFilmLikeCount(id);
      if (this.id() === id && !this.isSavingLike()) {
        this.likeCount.set(count);
      }
    } catch {
      // Without the number the recipe shows 0 hearts.
    }
  }

  /** Shows the heart state and count, remembers it in this browser and updates the results list. */
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

  /** Returns the message for a recipe that could not be loaded or does not exist. */
  private buildFailureText(): string {
    if (this.status() === 'error') {
      return 'We could not load this recipe. Please check your connection and try again.';
    }
    return 'We could not find this recipe. Maybe the link is not complete.';
  }

  /** Returns the numbers 1 to cooks, one for each cook. */
  private buildChefNumbers(cooks: number): number[] {
    return Array.from({ length: cooks }, function (_unused, index) {
      return index + 1;
    });
  }

  /** Returns the tags of the shown recipe, or an empty list when no recipe is shown. */
  private buildTags(): string[] {
    const recipe = this.recipe();
    if (!recipe) {
      return [];
    }
    return buildRecipeTags(recipe);
  }
}
