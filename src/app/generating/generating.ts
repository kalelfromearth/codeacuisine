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
  readonly dots = computed(() => '.'.repeat(this.dotCount()));

  constructor() {
    effect(this.openResultsOnSuccess.bind(this));
    this.startGenerationOnce();
    this.animateDots();
  }

  /** Starts the generation again after an error. */
  retry(): void {
    this.generator.generate();
  }

  private openResultsOnSuccess(): void {
    if (this.generator.status() === 'success') {
      this.router.navigateByUrl('/recipes');
    }
  }

  private startGenerationOnce(): void {
    if (this.generator.status() === 'idle') {
      this.generator.generate();
    }
  }

  private animateDots(): void {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
