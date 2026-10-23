import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IngredientUnit,
  MAX_AMOUNT_BY_UNIT,
  MIN_INGREDIENT_AMOUNT,
  UNIT_LABELS,
} from '../ingredient.model';
import { amountWithinUnitLimit } from '../ingredient-amount.validator';
import { InfoTip } from '../../shared/info-tip/info-tip';
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
  imports: [ReactiveFormsModule, InfoTip],
  templateUrl: './ingredient-form.html',
  styleUrl: './ingredient-form.scss',
})
export class IngredientForm {
  private readonly ingredientList = inject(IngredientListService);

  private readonly blockedAmountKeys = ['e', 'E', '+', '-', '.', ','];

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
    if (this.blockedAmountKeys.includes(event.key)) {
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
  applyUnitLimit(event: Event): void {
    const selectedUnit = (event.target as HTMLSelectElement).value as IngredientUnit;
    const amountControl = this.ingredientForm.controls.amount;
    this.ingredientForm.controls.unit.setValue(selectedUnit);
    if (amountControl.value > this.getCurrentMaxAmount()) {
      amountControl.setValue(this.getCurrentMaxAmount());
    }
    amountControl.updateValueAndValidity();
  }

  /** Returns the error message for the amount field, or an empty string if it is valid. */
  getAmountErrorMessage(): string {
    const errors = this.ingredientForm.controls.amount.errors;
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
      return `The maximum is ${errors['max'].max} ${this.getCurrentUnitLabel()}.`;
    }
    return 'Please use whole numbers only, without decimals.';
  }

  private resetForm(): void {
    this.ingredientForm.reset({ name: '', amount: 100, unit: 'gram' });
  }
}
