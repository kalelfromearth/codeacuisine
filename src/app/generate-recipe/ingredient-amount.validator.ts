import { AbstractControl, ValidationErrors } from '@angular/forms';
import { IngredientUnit, MAX_AMOUNT_BY_UNIT } from './ingredient.model';

/** Fails with a "max" error when the amount exceeds the limit of the selected unit. */
export function amountWithinUnitLimit(control: AbstractControl): ValidationErrors | null {
  const selectedUnit = control.parent?.get('unit')?.value as IngredientUnit | undefined;
  if (!selectedUnit || control.value === null || control.value === '') {
    return null;
  }
  const max = MAX_AMOUNT_BY_UNIT[selectedUnit];
  return control.value > max ? { max: { max, actual: control.value } } : null;
}
