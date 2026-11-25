import { Injectable, inject, signal } from '@angular/core';
import { NavigationStart, Router, withNavigationErrorHandler } from '@angular/router';

/** Remembers that a page could not be loaded, so the app frame can show a message with a button to try again. */
@Injectable({ providedIn: 'root' })
export class LoadErrorService {
  private readonly router = inject(Router);

  readonly hasLoadError = signal(false);

  constructor() {
    this.router.events.subscribe(this.clearOnNewNavigation.bind(this));
  }

  /** Marks that the page could not be loaded, for example because the network is gone or the file was replaced. */
  report(): void {
    this.hasLoadError.set(true);
  }

  /** Hides the message again. */
  clear(): void {
    this.hasLoadError.set(false);
  }

  /** Loads the current address from the server again, which also brings in a new version of the app. */
  reloadPage(): void {
    location.reload();
  }

  /** Hides the message as soon as the visitor starts to open another page. */
  private clearOnNewNavigation(event: unknown): void {
    if (event instanceof NavigationStart) {
      this.clear();
    }
  }
}

/** Router handler that reports a page which could not be opened, instead of leaving the visitor with nothing. */
export function reportNavigationError(): void {
  inject(LoadErrorService).report();
}

/** Router feature that connects the handler to the router. */
export const loadErrorRouterFeature = withNavigationErrorHandler(reportNavigationError);
