export type IngredientUnit = 'piece' | 'ml' | 'gram';

export const MIN_INGREDIENT_AMOUNT = 1;

export const UNIT_LABELS: Record<IngredientUnit, string> = {
  piece: 'pieces',
  ml: 'ml',
  gram: 'g',
};

export const MAX_AMOUNT_BY_UNIT: Record<IngredientUnit, number> = {
  piece: 30,
  ml: 10000,
  gram: 10000,
};

export interface Ingredient {
  name: string;
  amount: number;
  unit: IngredientUnit;
}

/** Returns the amount with a short unit, for example "100g" or "250ml", and only the number for pieces. */
export function formatIngredientAmount(ingredient: Ingredient): string {
  if (ingredient.unit === 'piece') {
    return `${ingredient.amount}`;
  }
  return `${ingredient.amount}${UNIT_LABELS[ingredient.unit]}`;
}
