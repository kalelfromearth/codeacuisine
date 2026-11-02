import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

// The suggestion workflow lives next to the generate workflow in n8n, so no second setting is needed.
const SUGGEST_URL = environment.n8nWebhookUrl.replace(/\/generate$/, '/suggest');
const MAX_SUGGESTIONS = 6;
const MAX_SUGGESTION_LENGTH = 40;

function isSuggestionText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_SUGGESTION_LENGTH;
}

/** Keeps only plain short texts of the n8n answer, so nothing unexpected reaches the page. */
export function readSuggestions(answer: unknown): string[] {
  const list = (answer as { suggestions?: unknown } | null)?.suggestions;
  if (!Array.isArray(list)) {
    return [];
  }
  return list.filter(isSuggestionText).slice(0, MAX_SUGGESTIONS);
}

@Injectable({ providedIn: 'root' })
export class IngredientSuggestionService {
  private readonly knownAnswers = new Map<string, string[]>();

  /** Asks n8n for ingredient names that start with the text. An empty list means nothing was found or the request failed. */
  async suggest(text: string, signal: AbortSignal): Promise<string[]> {
    const key = text.trim().toLowerCase();
    const knownAnswer = this.knownAnswers.get(key);
    if (knownAnswer) {
      return knownAnswer;
    }
    const suggestions = await this.fetchSuggestions(key, signal);
    if (suggestions.length > 0) {
      this.knownAnswers.set(key, suggestions);
    }
    return suggestions;
  }

  private async fetchSuggestions(key: string, signal: AbortSignal): Promise<string[]> {
    try {
      const response = await fetch(`${SUGGEST_URL}?q=${encodeURIComponent(key)}`, { signal });
      return response.ok ? readSuggestions(await response.json()) : [];
    } catch {
      return [];
    }
  }
}
