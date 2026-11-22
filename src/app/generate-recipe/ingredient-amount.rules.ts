import { FormControl, ValidationErrors, Validators } from '@angular/forms';
import { amountWithinUnitLimit } from './ingredient-amount.validator';
import {
  IngredientUnit,
  MAX_AMOUNT_BY_UNIT,
  MIN_INGREDIENT_AMOUNT,
  UNIT_LABELS,
} from './ingredient.model';

export const BLOCKED_AMOUNT_KEYS: readonly string[] = ['e', 'E', '+', '-', '.', ','];

/** Returns the error message for an amount field, or an empty string if it is valid. */
export function buildAmountErrorMessage(errors: ValidationErrors | null, unit: IngredientUnit): string {
  if (!errors) {
    return '';
  }
  if (errors['required']) {
    return 'Please enter an amount.';
  }
  if (errors['min']) {
    return `The amount must be at least ${MIN_INGREDIENT_AMOUNT}.`;
  }
  if (errors['max']) {
    return `The maximum is ${errors['max'].max} ${UNIT_LABELS[unit]}.`;
  }
  return 'Please use whole numbers only, without decimals.';
}

/** Lowers the amount to the limit of the given unit when it is above it, then revalidates it. */
export function capAmountToUnitLimit(amountControl: FormControl<number>, unit: IngredientUnit): void {
  const maxAmount = MAX_AMOUNT_BY_UNIT[unit];
  if (amountControl.value > maxAmount) {
    amountControl.setValue(maxAmount);
  }
  amountControl.updateValueAndValidity();
}

/** Creates the form control of an amount field with all checks that belong to it. */
export function createAmountControl(startValue: number): FormControl<number> {
  return new FormControl(startValue, {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.min(MIN_INGREDIENT_AMOUNT),
      amountWithinUnitLimit,
      Validators.pattern(/^\d+$/),
    ],
  });
}

/** Prevents typing characters that are not part of a whole number. */
export function blockNonWholeNumberKey(event: KeyboardEvent): void {
  if (BLOCKED_AMOUNT_KEYS.includes(event.key)) {
    event.preventDefault();
  }
}

/** Caps the amount at the maximum of the given unit while the user is typing. */
export function limitTypedAmount(event: Event, amountControl: FormControl<number>, unit: IngredientUnit): void {
  const typedAmount = Number((event.target as HTMLInputElement).value);
  if (typedAmount > MAX_AMOUNT_BY_UNIT[unit]) {
    amountControl.setValue(MAX_AMOUNT_BY_UNIT[unit]);
  }
}
