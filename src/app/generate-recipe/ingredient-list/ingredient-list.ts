import { Component, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  INGREDIENT_UNITS,
  Ingredient,
  IngredientUnit,
  MAX_AMOUNT_BY_UNIT,
  formatIngredientAmount,
} from '../ingredient.model';
import {
  blockNonWholeNumberKey,
  buildAmountErrorMessage,
  capAmountToUnitLimit,
  createAmountControl,
  limitTypedAmount,
} from '../ingredient-amount.rules';
import { prefersReducedMotion } from '../../shared/motion';
import { IngredientListService, MIN_INGREDIENTS } from '../ingredient-list.service';
import { UnitSelect } from '../unit-select/unit-select';

type IngredientEditControls = {
  amount: FormControl<number | null>;
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
  readonly units = INGREDIENT_UNITS;
  readonly editingPosition = signal<number | null>(null);
  readonly closingPosition = signal<number | null>(null);

  readonly editForm: FormGroup<IngredientEditControls> = new FormGroup<IngredientEditControls>({
    amount: createAmountControl(1),
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
    const edited = this.editForm.getRawValue();
    if (this.editForm.invalid || edited.amount === null) {
      this.editForm.markAllAsTouched();
      return;
    }
    const changedIngredient = { ...this.ingredients()[position], amount: edited.amount, unit: edited.unit };
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
    blockNonWholeNumberKey(event);
  }

  /** Returns the maximum amount allowed for the unit selected in the edit row. */
  getCurrentMaxAmount(): number {
    return MAX_AMOUNT_BY_UNIT[this.editForm.controls.unit.value];
  }

  /** Caps the amount at the maximum of the selected unit while the user is typing. */
  limitAmountToMaximum(event: Event): void {
    limitTypedAmount(event, this.editForm.controls.amount, this.editForm.controls.unit.value);
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

  /** Starts the closing animation of the edit row, or closes it at once when reduced motion is preferred. */
  private beginClosing(position: number): void {
    if (prefersReducedMotion()) {
      this.stopEditing(position);
      return;
    }
    this.closingPosition.set(position);
  }

  /** Leaves the edit mode and moves the focus back to the edit button of that row. */
  private stopEditing(position: number): void {
    this.editingPosition.set(null);
    this.focusAfterRender(`[data-edit-position="${position}"]`);
  }

  /** Focuses the element matching the selector once the next render has finished. */
  private focusAfterRender(selector: string): void {
    afterNextRender(this.focusElement.bind(this, selector), { injector: this.injector });
  }

  /** Focuses the element inside this component that matches the selector, if it exists. */
  private focusElement(selector: string): void {
    this.hostElement.nativeElement.querySelector<HTMLElement>(selector)?.focus();
  }
}
