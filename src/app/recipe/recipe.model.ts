import { Ingredient } from '../generate-recipe/ingredient.model';

export const RECIPE_TIME_CATEGORIES = ['quick', 'medium', 'complex'] as const;
export const RECIPE_CUISINES = ['german', 'italian', 'indian', 'japanese', 'gourmet', 'fusion'] as const;
export const RECIPE_DIETS = ['vegetarian', 'vegan', 'keto', 'none'] as const;

export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 12;
export const MIN_COOKS = 1;
export const MAX_COOKS = 4;

export type RecipeTimeCategory = (typeof RECIPE_TIME_CATEGORIES)[number];
export type RecipeCuisine = (typeof RECIPE_CUISINES)[number];
export type RecipeDiet = (typeof RECIPE_DIETS)[number];
export type CookCount = 1 | 2 | 3 | 4;

/** Payload sent from Angular to the n8n workflow to generate recipes. */
export interface RecipeRequest {
  ingredients: Ingredient[];
  servings: number;
  cooks: CookCount;
  timeCategory: RecipeTimeCategory;
  cuisine: RecipeCuisine;
  diet: RecipeDiet;
}

export interface RecipeIngredient extends Ingredient {
  isExtra: boolean;
}

export interface RecipeStep {
  title: string;
  text: string;
  chef: CookCount;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

/** A generated recipe as stored in the Firestore collection "recipes". */
export interface Recipe {
  id: string;
  title: string;
  cookingMinutes: number;
  timeCategory: RecipeTimeCategory;
  cuisine: RecipeCuisine;
  diet: RecipeDiet;
  servings: number;
  cooks: CookCount;
  nutrition: RecipeNutrition;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  likes: number;
  createdAt: string;
}
