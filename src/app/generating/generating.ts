import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeGeneratorService } from '../recipe/recipe-generator.service';
import { Button } from '../shared/button/button';
import { Header } from '../shared/header/header';

@Component({
  selector: 'app-generating',
  imports: [Button, Header],
  templateUrl: './generating.html',
  styleUrl: './generating.scss',
})
export class Generating {
  private readonly generator = inject(RecipeGeneratorService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dotCount = signal(1);

  readonly status = this.generator.status;
  readonly errorMessage = this.generator.errorMessage;
  readonly hasIngredientProblem = this.generator.hasIngredientProblem;
  readonly isQuotaUsedUp = this.generator.isQuotaUsedUp;
  readonly dots = computed(() => '.'.repeat(this.dotCount()));
  readonly prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    effect(this.openResultsOnSuccess.bind(this));
    this.startGenerationOnce();
    this.animateDots();
  }

  /** Tries again after an error: saves the waiting recipes again or starts a new generation. */
  retry(): void {
    this.generator.retry();
  }

  private openResultsOnSuccess(): void {
    if (this.generator.status() === 'success') {
      // Replace the loading page in the browser history, so that Back from the results does not land here again.
      this.router.navigateByUrl('/recipes', { replaceUrl: true });
    }
  }

  private startGenerationOnce(): void {
    if (this.generator.status() === 'idle') {
      this.generator.generate();
    }
  }

  private animateDots(): void {
    if (this.prefersReducedMotion) {
      this.dotCount.set(3);
      return;
    }
    const timerId = setInterval(this.advanceDots.bind(this), 450);
    this.destroyRef.onDestroy(clearInterval.bind(undefined, timerId));
  }

  private advanceDots(): void {
    this.dotCount.update(function (count) {
      return (count % 3) + 1;
    });
  }
}
