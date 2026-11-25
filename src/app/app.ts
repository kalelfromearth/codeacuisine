import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoadErrorService } from './shared/load-error/load-error.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly loadError = inject(LoadErrorService);

  /** Moves the keyboard focus to the main content of the current page, past the header. */
  skipToContent(event: Event): void {
    event.preventDefault();
    const main = document.querySelector<HTMLElement>('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }
  }
}
