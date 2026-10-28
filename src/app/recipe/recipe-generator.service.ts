import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { RecipeRequestService } from './recipe-request.service';
import { RecipeStoreService } from './recipe-store.service';
import { Recipe, RecipeDraft, RecipeRequest } from './recipe.model';
import { forgetResultIds, readResultIds, rememberResultIds } from './result-memory';

export type GeneratorStatus = 'idle' | 'loading' | 'success' | 'error';

interface GeneratorResponse {
  recipes?: RecipeDraft[];
  message?: string;
}

const REQUEST_TIMEOUT_MS = 120000;

function getRecipeId(recipe: Recipe): string {
  return recipe.id;
}

function isRecipe(recipe: Recipe | null): recipe is Recipe {
  return recipe !== null;
}

@Injectable({ providedIn: 'root' })
export class RecipeGeneratorService {
  private readonly recipeRequestService = inject(RecipeRequestService);
  private readonly recipeStore = inject(RecipeStoreService);
  private unsavedDrafts: RecipeDraft[] = [];

  readonly status = signal<GeneratorStatus>('idle');
  readonly recipes = signal<Recipe[]>([]);
  readonly errorMessage = signal('');
  readonly hasIngredientProblem = signal(false);

  /** Sends the stored request to the n8n workflow, saves the recipes and stores them or an error message. */
  async generate(): Promise<void> {
    const request = this.recipeRequestService.request();
    if (!request) {
      return;
    }
    this.startLoading();
    try {
      await this.handleResponse(await this.postRequest(request));
    } catch (error) {
      this.fail(this.describeNetworkError(error));
    }
  }

  /** Tries again after an error: saves the waiting recipes if there are any, otherwise asks the AI again. */
  async retry(): Promise<void> {
    if (this.unsavedDrafts.length === 0) {
      await this.generate();
      return;
    }
    this.startLoading();
    await this.saveDrafts(this.unsavedDrafts);
  }

  /** Shows the last results again after a reload, using the ids remembered in this tab. Returns true on success. */
  async restoreResults(): Promise<boolean> {
    const ids = readResultIds();
    if (ids.length === 0) {
      return false;
    }
    try {
      const loaded = await Promise.all(ids.map(this.loadRecipeById.bind(this)));
      return this.showRestoredRecipes(loaded.filter(isRecipe));
    } catch {
      return false;
    }
  }

  /** Forgets the last result so a new generation can start from scratch. */
  reset(): void {
    forgetResultIds();
    this.status.set('idle');
    this.recipes.set([]);
    this.errorMessage.set('');
    this.hasIngredientProblem.set(false);
    this.unsavedDrafts = [];
  }

  private loadRecipeById(id: string): Promise<Recipe | null> {
    return this.recipeStore.loadRecipe(id);
  }

  private showRestoredRecipes(recipes: Recipe[]): boolean {
    if (recipes.length === 0) {
      return false;
    }
    this.recipes.set(recipes);
    this.status.set('success');
    return true;
  }

  private startLoading(): void {
    this.status.set('loading');
    this.errorMessage.set('');
    this.hasIngredientProblem.set(false);
    this.recipes.set([]);
  }

  private postRequest(request: RecipeRequest): Promise<Response> {
    return fetch(environment.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  }

  private async handleResponse(response: Response): Promise<void> {
    const body = await this.readJson(response);
    if (response.ok && Array.isArray(body?.recipes) && body.recipes.length > 0) {
      await this.saveDrafts(body.recipes);
      return;
    }
    this.hasIngredientProblem.set(response.status === 422);
    this.fail(this.describeFailure(response.status, body?.message));
  }

  private async saveDrafts(drafts: RecipeDraft[]): Promise<void> {
    try {
      const savedRecipes = await this.recipeStore.saveRecipes(drafts);
      rememberResultIds(savedRecipes.map(getRecipeId));
      this.recipes.set(savedRecipes);
      this.unsavedDrafts = [];
      this.status.set('success');
    } catch {
      this.unsavedDrafts = drafts;
      this.fail('We could not save your recipes. Please try again.');
    }
  }

  private async readJson(response: Response): Promise<GeneratorResponse | null> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private describeFailure(status: number, serverMessage?: string): string {
    if (status === 429) {
      return serverMessage ?? 'The daily limit is reached. Please try again tomorrow.';
    }
    if (status === 422) {
      return serverMessage ?? "Some entries don't look like real ingredients. Please check your list.";
    }
    if (status === 400) {
      return 'Some of your entries are not valid. Please go back and check them.';
    }
    return serverMessage ?? 'Something went wrong while creating your recipes. Please try again.';
  }

  private describeNetworkError(error: unknown): string {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return 'This is taking too long. Please try again.';
    }
    return 'We could not reach the recipe service. Please check your connection and try again.';
  }

  private fail(message: string): void {
    this.errorMessage.set(message);
    this.status.set('error');
  }
}
