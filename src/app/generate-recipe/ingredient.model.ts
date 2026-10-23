export type IngredientUnit = 'piece' | 'ml' | 'gram';

export interface Ingredient {
  name: string;
  amount: number;
  unit: IngredientUnit;
}

/** Returns the amount with a short unit, for example "100g", "250ml" or "2 pieces". */
export function formatIngredientAmount(ingredient: Ingredient): string {
  if (ingredient.unit === 'piece') {
    return `${ingredient.amount} ${ingredient.amount === 1 ? 'piece' : 'pieces'}`;
  }
  const shortUnit = ingredient.unit === 'gram' ? 'g' : 'ml';
  return `${ingredient.amount}${shortUnit}`;
}
