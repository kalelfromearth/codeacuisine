import { FormControl } from '@angular/forms';
import { buildAmountErrorMessage, capAmountToUnitLimit, createAmountControl } from './ingredient-amount.rules';
import { describeIngredientAmount } from './ingredient.model';

describe('buildAmountErrorMessage', function () {
  it('returns an empty text when there is no error', function () {
    expect(buildAmountErrorMessage(null, 'gram')).toBe('');
  });

  it('explains each kind of error', function () {
    expect(buildAmountErrorMessage({ required: true }, 'gram')).toBe('Please enter an amount.');
    expect(buildAmountErrorMessage({ min: { min: 1 } }, 'gram')).toBe('The amount must be at least 1.');
    expect(buildAmountErrorMessage({ max: { max: 30 } }, 'piece')).toBe('The maximum is 30 pieces.');
    expect(buildAmountErrorMessage({ pattern: true }, 'ml')).toBe('Please use whole numbers only, without decimals.');
  });
});

describe('capAmountToUnitLimit', function () {
  it('lowers an amount above the limit of the new unit', function () {
    const amount = new FormControl<number | null>(5000);
    capAmountToUnitLimit(amount, 'piece');
    expect(amount.value).toBe(30);
  });

  it('keeps an amount within the limit', function () {
    const amount = new FormControl<number | null>(100);
    capAmountToUnitLimit(amount, 'gram');
    expect(amount.value).toBe(100);
  });
});

describe('describeIngredientAmount', function () {
  it('writes pieces in singular and plural and short units for the rest', function () {
    expect(describeIngredientAmount({ name: 'Egg', amount: 1, unit: 'piece' })).toBe('1 piece');
    expect(describeIngredientAmount({ name: 'Egg', amount: 2, unit: 'piece' })).toBe('2 pieces');
    expect(describeIngredientAmount({ name: 'Pasta', amount: 80, unit: 'gram' })).toBe('80g');
    expect(describeIngredientAmount({ name: 'Milk', amount: 250, unit: 'ml' })).toBe('250ml');
  });
});

describe('createAmountControl', function () {
  it('starts empty and is not valid until an amount is typed', function () {
    const amount = createAmountControl(null);
    expect(amount.value).toBeNull();
    expect(amount.errors?.['required']).toBe(true);
  });

  it('accepts a whole number', function () {
    expect(createAmountControl(200).valid).toBe(true);
  });

  it('rejects a number with decimals and a number below the minimum', function () {
    expect(createAmountControl(1.5).errors?.['pattern']).toBeTruthy();
    expect(createAmountControl(0).errors?.['min']).toBeTruthy();
  });
});
