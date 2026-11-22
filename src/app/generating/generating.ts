import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeGeneratorService } from '../recipe/recipe-generator.service';
import { Button } from '../shared/button/button';
import { Header } from '../shared/header/header';
import { prefersReducedMotion } from '../shared/motion';

// After this time the page tells that the AI needs longer than usual, for example when the provider asks to slow down.
const SLOW_AFTER_MS = 15000;

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
  private slowTimerId: ReturnType<typeof setTimeout> | undefined;
  private waitTimerId: ReturnType<typeof setInterval> | undefined;

  readonly status = this.generator.status;
  readonly errorMessage = this.generator.errorMessage;
  readonly hasIngredientProblem = this.generator.hasIngredientProblem;
  readonly isQuotaUsedUp = this.generator.isQuotaUsedUp;
  readonly isTooFast = computed(this.hasToWait.bind(this));
  /** The seconds that are left until "Try again" works after a too-fast answer. */
  readonly secondsLeft = signal(0);
  readonly isTakingLong = signal(false);
  readonly dots = computed(() => '.'.repeat(this.dotCount()));
  readonly prefersReducedMotion = prefersReducedMotion();

  constructor() {
    effect(this.openResultsOnSuccess.bind(this));
    effect(this.startWaitCountdown.bind(this));
    this.startGenerationOnce();
    this.animateDots();
    this.watchForSlowAnswer();
    this.destroyRef.onDestroy(this.stopWatchingForSlowAnswer.bind(this));
    this.destroyRef.onDestroy(this.stopWaitCountdown.bind(this));
  }

  /** Tries again after an error: saves the waiting recipes again or starts a new generation. */
  retry(): void {
    if (this.secondsLeft() > 0) {
      return;
    }
    this.generator.retry();
    this.watchForSlowAnswer();
  }

  /** Returns true when the generator asks the visitor to wait before trying again. */
  private hasToWait(): boolean {
    return this.generator.retryAfterSeconds() > 0;
  }

  /** Starts the countdown with the number of seconds the generator asks to wait. */
  private startWaitCountdown(): void {
    const seconds = this.generator.retryAfterSeconds();
    untracked(this.runWaitCountdown.bind(this, seconds));
  }

  /** Restarts the countdown at the given seconds and ticks it down once per second. */
  private runWaitCountdown(seconds: number): void {
    this.stopWaitCountdown();
    this.secondsLeft.set(seconds);
    if (seconds > 0) {
      this.waitTimerId = setInterval(this.tickWaitCountdown.bind(this), 1000);
    }
  }

  /** Lowers the remaining seconds by one and stops the countdown at zero. */
  private tickWaitCountdown(): void {
    this.secondsLeft.update(function (seconds) {
      return Math.max(0, seconds - 1);
    });
    if (this.secondsLeft() === 0) {
      this.stopWaitCountdown();
    }
  }

  /** Stops the running wait countdown timer. */
  private stopWaitCountdown(): void {
    clearInterval(this.waitTimerId);
  }

  /** Navigates to the results page as soon as the generation has succeeded. */
  private openResultsOnSuccess(): void {
    if (this.generator.status() === 'success') {
      // Replace the loading page in the browser history, so that Back from the results does not land here again.
      this.router.navigateByUrl('/recipes', { replaceUrl: true });
    }
  }

  /** Starts the recipe generation only when no generation has been started yet. */
  private startGenerationOnce(): void {
    if (this.generator.status() === 'idle') {
      this.generator.generate();
    }
  }

  /** Restarts the timer that marks the answer as slow when it takes too long. */
  private watchForSlowAnswer(): void {
    this.stopWatchingForSlowAnswer();
    this.isTakingLong.set(false);
    this.slowTimerId = setTimeout(this.isTakingLong.set.bind(this.isTakingLong, true), SLOW_AFTER_MS);
  }

  /** Cancels the timer that marks the answer as slow. */
  private stopWatchingForSlowAnswer(): void {
    clearTimeout(this.slowTimerId);
  }

  /** Animates the loading dots until the component is destroyed, or shows all three when reduced motion is preferred. */
  private animateDots(): void {
    if (this.prefersReducedMotion) {
      this.dotCount.set(3);
      return;
    }
    const timerId = setInterval(this.advanceDots.bind(this), 450);
    this.destroyRef.onDestroy(clearInterval.bind(undefined, timerId));
  }

  /** Shows one more loading dot and starts again at one after three. */
  private advanceDots(): void {
    this.dotCount.update(function (count) {
      return (count % 3) + 1;
    });
  }
}
