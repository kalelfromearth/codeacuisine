import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

let nextPopupId = 0;

@Component({
  selector: 'app-popup',
  imports: [],
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class Popup {
  private readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly heading = input.required<string>();
  readonly isOpen = input(false);
  readonly closed = output<void>();
  readonly headingId = `popup-heading-${nextPopupId++}`;

  constructor() {
    effect(this.syncDialogWithOpenState.bind(this));
  }

  /** Asks the parent to close the popup, used by the close button, Esc and the backdrop. */
  requestClose(): void {
    this.closed.emit();
  }

  /** Requests closing when the dark backdrop around the box is clicked. */
  requestCloseOnBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogElement().nativeElement) {
      this.requestClose();
    }
  }

  private syncDialogWithOpenState(): void {
    const dialog = this.dialogElement().nativeElement;
    if (this.isOpen() && !dialog.open) {
      dialog.showModal();
    } else if (!this.isOpen() && dialog.open) {
      dialog.close();
    }
  }
}
