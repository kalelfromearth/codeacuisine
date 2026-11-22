import { Injectable, computed, signal } from '@angular/core';
import { environment } from '../../environments/environment';

// The quota status lives next to the generate workflow in n8n, so no second setting is needed.
const QUOTA_URL = environment.n8nWebhookUrl.replace(/\/generate$/, '/quota');
const USED_UP_REASONS = ['quota-ip', 'quota-total', 'too-many-errors'];
const MAX_WAIT_SECONDS = 120;

/** How many recipe runs one IP address may start per day and how many are left today. */
export interface QuotaInfo {
  limit: number;
  remaining: number;
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

/** Reads the limit and the remaining runs from an n8n answer, or returns null when the answer does not have them. */
export function readQuota(answer: unknown): QuotaInfo | null {
  const data = answer as { limit?: unknown; remaining?: unknown } | null;
  const limit = data?.limit;
  const remaining = data?.remaining;
  return isCount(limit) && isCount(remaining) ? { limit, remaining } : null;
}

/** Returns true when n8n refused a run because the daily quota of the IP or of the whole app is used up, or too many tries with entries that are not ingredients. */
export function isQuotaUsedUp(reason: unknown): boolean {
  return typeof reason === 'string' && USED_UP_REASONS.includes(reason);
}

/** Returns the seconds a person has to wait after a "too-fast" answer of n8n, and 0 for every other answer. */
export function readWaitSeconds(reason: unknown, seconds: unknown): number {
  const isCount = Number.isInteger(seconds) && (seconds as number) > 0 && (seconds as number) <= MAX_WAIT_SECONDS;
  return reason === 'too-fast' && isCount ? (seconds as number) : 0;
}

@Injectable({ providedIn: 'root' })
export class QuotaService {
  readonly quota = signal<QuotaInfo | null>(null);
  readonly isUsedUp = computed(this.hasNoRunsLeft.bind(this));

  /** Asks n8n how many recipe runs are left today. Keeps the last known value when the request fails. */
  async refresh(): Promise<void> {
    try {
      const response = await fetch(QUOTA_URL, { cache: 'no-store' });
      const quota = readQuota(await response.json());
      if (quota) {
        this.quota.set(quota);
      }
    } catch {
      // The page works without the hint, so a failed status request is simply ignored.
    }
  }

  /** Updates the remaining runs with the number that n8n sent back after a run. */
  updateRemaining(remaining: unknown): void {
    const current = this.quota();
    if (current && isCount(remaining)) {
      this.quota.set({ ...current, remaining });
    }
  }

  private hasNoRunsLeft(): boolean {
    return this.quota()?.remaining === 0;
  }
}
