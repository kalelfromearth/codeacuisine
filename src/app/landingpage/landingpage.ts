import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../shared/header/header';
import { Button } from '../shared/button/button';
import { Popup } from '../shared/popup/popup';

const BETTER_LIFE_SEEN_KEY = 'codeacuisine.betterLifeSeen';

function readBetterLifeSeen(): boolean {
  try {
    return localStorage.getItem(BETTER_LIFE_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberBetterLifeSeen(): void {
  try {
    localStorage.setItem(BETTER_LIFE_SEEN_KEY, '1');
  } catch {
    // Without storage the button simply shows again at the next visit.
  }
}

@Component({
  selector: 'app-landingpage',
  imports: [Header, Button, Popup, RouterLink],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.scss',
})
export class Landingpage {
  readonly isBetterLifeButtonVisible = signal(!readBetterLifeSeen());
  readonly isBetterLifeOpen = signal(false);

  /** Opens the information about plant-based food and remembers that it was seen. */
  openBetterLife(): void {
    rememberBetterLifeSeen();
    this.isBetterLifeOpen.set(true);
  }

  /** Closes the information. The button is gone afterwards, it is shown only once. */
  closeBetterLife(): void {
    this.isBetterLifeOpen.set(false);
    this.isBetterLifeButtonVisible.set(false);
  }
}
