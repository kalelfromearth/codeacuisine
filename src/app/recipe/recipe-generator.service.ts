import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { RecipeRequestService } from './recipe-request.service';
import { RecipeDraft, RecipeRequest } from './recipe.model';

export type GeneratorStatus = 'idle' | 'loading' | 'success' | 'error';

interface GeneratorResponse {
  recipes?: RecipeDraft[];
  message?: string;
}

const REQUEST_TIMEOUT_MS = 120000;

@Injectable({ providedIn: 'root' })
export class RecipeGeneratorService {
  private readonly recipeRequestService = inject(RecipeRequestService);

  readonly status = signal<GeneratorStatus>('idle');
  readonly recipes = signal<RecipeDraft[]>([]);
  readonly errorMessage = signal('');

  /** Sends the stored request to the n8n workflow and stores the recipes or an error message. */
  async generate(): Promise<void> {
    const request = this.recipeRequestService.request();
    if (!request) {
      return;
    }
    this.status.set('loading');
    this.errorMessage.set('');
    this.recipes.set([]);
    try {
      await this.handleResponse(await this.postRequest(request));
    } catch (error) {
      this.fail(this.describeNetworkError(error));
    }
  }

  /** Forgets the last result so a new generation can start from scratch. */
  reset(): void {
    this.status.set('idle');
    this.recipes.set([]);
    this.errorMessage.set('');
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
      this.recipes.set(body.recipes);
      this.status.set('success');
      return;
    }
    this.fail(this.describeFailure(response.status, body?.message));
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
