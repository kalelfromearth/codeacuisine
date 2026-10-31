import { FormControl } from '@angular/forms';
import { buildAmountErrorMessage, capAmountToUnitLimit } from './ingredient-amount.rules';
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
    const amount = new FormControl(5000, { nonNullable: true });
    capAmountToUnitLimit(amount, 'piece');
    expect(amount.value).toBe(30);
  });

  it('keeps an amount within the limit', function () {
    const amount = new FormControl(100, { nonNullable: true });
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
