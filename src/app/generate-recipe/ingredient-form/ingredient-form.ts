import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IngredientUnit,
  MAX_AMOUNT_BY_UNIT,
  MIN_INGREDIENT_AMOUNT,
  UNIT_LABELS,
} from '../ingredient.model';
import { amountWithinUnitLimit } from '../ingredient-amount.validator';
import {
  BLOCKED_AMOUNT_KEYS,
  buildAmountErrorMessage,
  capAmountToUnitLimit,
} from '../ingredient-amount.rules';
import { InfoTip } from '../../shared/info-tip/info-tip';
import { UnitSelect } from '../unit-select/unit-select';
import {
  IngredientListService,
  MAX_INGREDIENTS,
  MIN_INGREDIENTS,
} from '../ingredient-list.service';

type IngredientFormControls = {
  name: FormControl<string>;
  amount: FormControl<number>;
  unit: FormControl<IngredientUnit>;
};

@Component({
  selector: 'app-ingredient-form',
  imports: [ReactiveFormsModule, InfoTip, UnitSelect],
  templateUrl: './ingredient-form.html',
  styleUrl: './ingredient-form.scss',
})
export class IngredientForm {
  private readonly ingredientList = inject(IngredientListService);

  readonly minIngredients = MIN_INGREDIENTS;
  readonly maxIngredients = MAX_INGREDIENTS;
  readonly maxAmountByUnit = MAX_AMOUNT_BY_UNIT;
  readonly isListFull = this.ingredientList.isListFull;
  readonly units: IngredientUnit[] = ['piece', 'ml', 'gram'];

  readonly ingredientForm: FormGroup<IngredientFormControls> = new FormGroup<IngredientFormControls>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    amount: new FormControl(100, {
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

  /** Adds the entered ingredient to the shared list and resets the form. */
  addIngredient(): void {
    if (this.ingredientForm.invalid) {
      this.ingredientForm.markAllAsTouched();
      return;
    }
    this.ingredientList.addIngredient(this.ingredientForm.getRawValue());
    this.resetForm();
  }

  /** Prevents typing characters that are not part of a whole number. */
  blockNonWholeNumberKeys(event: KeyboardEvent): void {
    if (BLOCKED_AMOUNT_KEYS.includes(event.key)) {
      event.preventDefault();
    }
  }

  /** Returns the maximum amount allowed for the currently selected unit. */
  getCurrentMaxAmount(): number {
    return MAX_AMOUNT_BY_UNIT[this.ingredientForm.controls.unit.value];
  }

  /** Returns the display name of the currently selected unit, e.g. "ml". */
  getCurrentUnitLabel(): string {
    return UNIT_LABELS[this.ingredientForm.controls.unit.value];
  }

  /** Caps the amount at the maximum of the selected unit while the user is typing. */
  limitAmountToMaximum(event: Event): void {
    const typedAmount = Number((event.target as HTMLInputElement).value);
    if (typedAmount > this.getCurrentMaxAmount()) {
      this.ingredientForm.controls.amount.setValue(this.getCurrentMaxAmount());
    }
  }

  /** Applies the limit of the newly selected unit to the amount and revalidates it. */
  applyUnitLimit(selectedUnit: IngredientUnit): void {
    this.ingredientForm.controls.unit.setValue(selectedUnit);
    capAmountToUnitLimit(this.ingredientForm.controls.amount, selectedUnit);
  }

  /** Returns the error message for the amount field, or an empty string if it is valid. */
  getAmountErrorMessage(): string {
    return buildAmountErrorMessage(
      this.ingredientForm.controls.amount.errors,
      this.ingredientForm.controls.unit.value,
    );
  }

  private resetForm(): void {
    this.ingredientForm.reset({ name: '', amount: 100, unit: 'gram' });
  }
}
