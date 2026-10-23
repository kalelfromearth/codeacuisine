import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';

let nextStepperId = 0;

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss',
})
export class Stepper {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<number>>();
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly unitSingular = input.required<string>();
  readonly unitPlural = input.required<string>();
  readonly bubbleValue = input<number>();
  readonly bubbleText = input('');
  readonly labelId = `stepper-label-${nextStepperId++}`;

  /** Lowers the value by one, but not below the minimum. */
  decrease(): void {
    this.setLimitedValue(this.control().value - 1);
  }

  /** Raises the value by one, but not above the maximum. */
  increase(): void {
    this.setLimitedValue(this.control().value + 1);
  }

  /** Returns true when the value cannot be lowered any further. */
  isAtMinimum(): boolean {
    return this.control().value <= this.min();
  }

  /** Returns true when the value cannot be raised any further. */
  isAtMaximum(): boolean {
    return this.control().value >= this.max();
  }

  /** Returns true while the value equals the value that should show the speech bubble. */
  isBubbleVisible(): boolean {
    return this.bubbleValue() !== undefined && this.control().value === this.bubbleValue();
  }

  /** Returns the unit in singular for the value 1, otherwise in plural. */
  getUnitLabel(): string {
    return this.control().value === 1 ? this.unitSingular() : this.unitPlural();
  }

  /** Returns the screen reader label of the minus button. */
  getDecreaseLabel(): string {
    return `Decrease ${this.unitPlural().toLowerCase()}`;
  }

  /** Returns the screen reader label of the plus button. */
  getIncreaseLabel(): string {
    return `Increase ${this.unitPlural().toLowerCase()}`;
  }

  private setLimitedValue(newValue: number): void {
    const limitedValue = Math.min(this.max(), Math.max(this.min(), newValue));
    this.control().setValue(limitedValue);
    this.control().markAsDirty();
  }
}
