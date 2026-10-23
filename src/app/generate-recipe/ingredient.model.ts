export type IngredientUnit = 'piece' | 'ml' | 'gram';

export interface Ingredient {
  name: string;
  amount: number;
  unit: IngredientUnit;
}
