import { Injectable, inject } from '@angular/core';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FirebaseService } from '../shared/firebase/firebase.service';
import { Recipe, RecipeDraft, RecipeIngredient, RecipeStep } from './recipe.model';

const RECIPES_COLLECTION = 'recipes';

function pickIngredient(ingredient: RecipeIngredient): RecipeIngredient {
  return {
    name: ingredient.name,
    amount: ingredient.amount,
    unit: ingredient.unit,
    isExtra: ingredient.isExtra,
  };
}

function pickStep(step: RecipeStep): RecipeStep {
  return { title: step.title, text: step.text, chef: step.chef };
}

function pickBasics(draft: RecipeDraft) {
  return {
    title: draft.title,
    cookingMinutes: draft.cookingMinutes,
    timeCategory: draft.timeCategory,
    cuisine: draft.cuisine,
    diet: draft.diet,
    servings: draft.servings,
    cooks: draft.cooks,
  };
}

/** Copies exactly the fields the Firestore rules allow, so nothing unknown is ever sent. */
function pickDocumentFields(draft: RecipeDraft): RecipeDraft {
  return {
    ...pickBasics(draft),
    nutrition: {
      calories: draft.nutrition.calories,
      protein: draft.nutrition.protein,
      fat: draft.nutrition.fat,
      carbs: draft.nutrition.carbs,
    },
    ingredients: draft.ingredients.map(pickIngredient),
    steps: draft.steps.map(pickStep),
  };
}

@Injectable({ providedIn: 'root' })
export class RecipeStoreService {
  private readonly firestore = inject(FirebaseService).firestore;

  /** Saves all drafts as new recipes and returns them with their ids. */
  saveRecipes(drafts: RecipeDraft[]): Promise<Recipe[]> {
    return Promise.all(drafts.map(this.saveRecipe.bind(this)));
  }

  /** Saves one draft with 0 likes and the server time and returns it with its new id. */
  async saveRecipe(draft: RecipeDraft): Promise<Recipe> {
    const fields = pickDocumentFields(draft);
    const reference = await addDoc(collection(this.firestore, RECIPES_COLLECTION), {
      ...fields,
      likes: 0,
      createdAt: serverTimestamp(),
    });
    return { ...fields, id: reference.id, likes: 0, createdAt: new Date().toISOString() };
  }
}
