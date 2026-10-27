import { Component, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Ingredient,
  IngredientUnit,
  MAX_AMOUNT_BY_UNIT,
  MIN_INGREDIENT_AMOUNT,
  formatIngredientAmount,
} from '../ingredient.model';
import { amountWithinUnitLimit } from '../ingredient-amount.validator';
import {
  BLOCKED_AMOUNT_KEYS,
  buildAmountErrorMessage,
  capAmountToUnitLimit,
} from '../ingredient-amount.rules';
import { IngredientListService, MIN_INGREDIENTS } from '../ingredient-list.service';
import { UnitSelect } from '../unit-select/unit-select';

type IngredientEditControls = {
  amount: FormControl<number>;
  unit: FormControl<IngredientUnit>;
};

@Component({
  selector: 'app-ingredient-list',
  imports: [ReactiveFormsModule, UnitSelect],
  templateUrl: './ingredient-list.html',
  styleUrl: './ingredient-list.scss',
})
export class IngredientList {
  private readonly ingredientList = inject(IngredientListService);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly minIngredients = MIN_INGREDIENTS;
  readonly ingredients = this.ingredientList.ingredients;
  readonly units: IngredientUnit[] = ['piece', 'ml', 'gram'];
  readonly editingPosition = signal<number | null>(null);
  readonly closingPosition = signal<number | null>(null);

  readonly editForm: FormGroup<IngredientEditControls> = new FormGroup<IngredientEditControls>({
    amount: new FormControl(1, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(MIN_INGREDIENT_AMOUNT),
        amountWithinUnitLimit,
        Validators.pattern(/^\d+$/),
      ],
    }),
    unit: new FormControl<IngredientUnit>('gram', { nonNullable: true }),
  });

  /** Returns the amount of an ingredient with a short unit, e.g. "100g". */
  formatAmount(ingredient: Ingredient): string {
    return formatIngredientAmount(ingredient);
  }

  /** Returns true when the ingredient at the given position is currently being edited. */
  isEditing(position: number): boolean {
    return this.editingPosition() === position;
  }

  /** Returns true while the edit row at the given position plays its closing animation. */
  isClosing(position: number): boolean {
    return this.closingPosition() === position;
  }

  /** Switches the row at the given position to edit mode and focuses the amount field. */
  startEditing(position: number): void {
    const ingredient = this.ingredients()[position];
    this.editForm.reset({ amount: ingredient.amount, unit: ingredient.unit });
    this.editForm.controls.amount.updateValueAndValidity();
    this.closingPosition.set(null);
    this.editingPosition.set(position);
    this.focusAfterRender('.ingredient-list__edit-amount');
  }

  /** Saves the edited amount and unit and closes the edit row. */
  saveEditing(): void {
    const position = this.editingPosition();
    if (position === null || this.closingPosition() !== null) {
      return;
    }
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const changedIngredient = { ...this.ingredients()[position], ...this.editForm.getRawValue() };
    this.ingredientList.updateIngredient(position, changedIngredient);
    this.beginClosing(position);
  }

  /** Closes the edit row without saving. */
  cancelEditing(): void {
    const position = this.editingPosition();
    if (position !== null && this.closingPosition() === null) {
      this.beginClosing(position);
    }
  }

  /** Leaves the edit mode once the closing animation of the edit row has finished. */
  finishClosing(event: AnimationEvent): void {
    const position = this.closingPosition();
    if (position !== null && event.target === event.currentTarget) {
      this.closingPosition.set(null);
      this.stopEditing(position);
    }
  }

  /** Removes the ingredient at the given position from the shared list. */
  removeIngredient(position: number): void {
    this.closingPosition.set(null);
    this.editingPosition.set(null);
    this.ingredientList.removeIngredient(position);
  }

  /** Prevents typing characters that are not part of a whole number. */
  blockNonWholeNumberKeys(event: KeyboardEvent): void {
    if (BLOCKED_AMOUNT_KEYS.includes(event.key)) {
      event.preventDefault();
    }
  }

  /** Returns the maximum amount allowed for the unit selected in the edit row. */
  getCurrentMaxAmount(): number {
    return MAX_AMOUNT_BY_UNIT[this.editForm.controls.unit.value];
  }

  /** Caps the amount at the maximum of the selected unit while the user is typing. */
  limitAmountToMaximum(event: Event): void {
    const typedAmount = Number((event.target as HTMLInputElement).value);
    if (typedAmount > this.getCurrentMaxAmount()) {
      this.editForm.controls.amount.setValue(this.getCurrentMaxAmount());
    }
  }

  /** Applies the limit of the newly selected unit to the amount in the edit row. */
  applyUnitLimit(selectedUnit: IngredientUnit): void {
    this.editForm.controls.unit.setValue(selectedUnit);
    capAmountToUnitLimit(this.editForm.controls.amount, selectedUnit);
  }

  /** Returns the error message for the amount in the edit row, or an empty string. */
  getAmountErrorMessage(): string {
    return buildAmountErrorMessage(this.editForm.controls.amount.errors, this.editForm.controls.unit.value);
  }

  private beginClosing(position: number): void {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.stopEditing(position);
      return;
    }
    this.closingPosition.set(position);
  }

  private stopEditing(position: number): void {
    this.editingPosition.set(null);
    this.focusAfterRender(`[data-edit-position="${position}"]`);
  }

  private focusAfterRender(selector: string): void {
    afterNextRender(this.focusElement.bind(this, selector), { injector: this.injector });
  }

  private focusElement(selector: string): void {
    this.hostElement.nativeElement.querySelector<HTMLElement>(selector)?.focus();
  }
}
