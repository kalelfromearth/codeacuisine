import { Injectable, signal } from '@angular/core';
import { RecipeRequest } from './recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeRequestService {
  readonly request = signal<RecipeRequest | null>(null);

  /** Stores the request that will be sent to the n8n workflow. */
  setRequest(request: RecipeRequest): void {
    this.request.set(request);
  }
}
