import { Component, ElementRef, inject, input, signal } from '@angular/core';

let nextInfoTipId = 0;

@Component({
  selector: 'app-info-tip',
  imports: [],
  templateUrl: './info-tip.html',
  styleUrl: './info-tip.scss',
  host: {
    '(document:keydown.escape)': 'close()',
    '(document:click)': 'closeOnOutsideClick($event)',
    '(pointerenter)': 'openOnMouseHover($event)',
    '(pointerleave)': 'closeOnMouseLeave($event)',
  },
})
export class InfoTip {
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private isPinned = false;

  readonly label = input('More information');
  readonly tipId = `info-tip-${nextInfoTipId++}`;
  readonly isOpen = signal(false);

  /** Opens or closes the tip permanently, used for click, tap and keyboard. */
  toggle(): void {
    if (this.isPinned) {
      this.close();
      return;
    }
    this.isPinned = true;
    this.isOpen.set(true);
  }

  /** Closes the tip and releases the permanent state. */
  close(): void {
    this.isPinned = false;
    this.isOpen.set(false);
  }

  /** Closes the tip when the user clicks or taps outside of it. */
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.hostElement.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  /** Shows the tip temporarily while a mouse pointer is over it. */
  openOnMouseHover(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && !this.isPinned) {
      this.isOpen.set(true);
    }
  }

  /** Hides a temporarily shown tip when the mouse pointer leaves. */
  closeOnMouseLeave(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && !this.isPinned) {
      this.isOpen.set(false);
    }
  }
}
