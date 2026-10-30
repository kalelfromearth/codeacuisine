import { Injectable, inject } from '@angular/core';
import {
  DocumentData,
  QueryConstraint,
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FirebaseService } from '../shared/firebase/firebase.service';
import { Recipe, RecipeCuisine, RecipeDraft, RecipeIngredient, RecipeStep } from './recipe.model';

const RECIPES_COLLECTION = 'recipes';

/** Recipes per page. The Firestore rules allow lists of at most this size, keep both in sync. */
export const RECIPES_PAGE_SIZE = 12;
/** Number of recipes in each row on the start page of the cookbook. */
export const SHELF_COUNT = 3;

export type RecipeSort = 'likes' | 'newest';
export type RecipePageCursor = QueryDocumentSnapshot<DocumentData>;

/** One page of recipes and the marker from which the next page starts. */
export interface RecipePage {
  recipes: Recipe[];
  cursor: RecipePageCursor | null;
  hasMore: boolean;
}

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

function readCreatedAt(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date().toISOString();
}

function toRecipe(id: string, data: DocumentData): Recipe {
  const fields = pickDocumentFields(data as RecipeDraft);
  return { ...fields, id, likes: data['likes'], createdAt: readCreatedAt(data['createdAt']) };
}

function toRecipeFromDocument(document: QueryDocumentSnapshot<DocumentData>): Recipe {
  return toRecipe(document.id, document.data());
}

function buildSortConstraints(sort: RecipeSort): QueryConstraint[] {
  const newestFirst = orderBy('createdAt', 'desc');
  return sort === 'likes' ? [orderBy('likes', 'desc'), newestFirst] : [newestFirst];
}

function buildPageConstraints(
  cuisine: RecipeCuisine,
  sort: RecipeSort,
  cursor: RecipePageCursor | null,
): QueryConstraint[] {
  const constraints = [where('cuisine', '==', cuisine), ...buildSortConstraints(sort)];
  if (cursor) {
    constraints.push(startAfter(cursor));
  }
  return [...constraints, limit(RECIPES_PAGE_SIZE)];
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

  /** Raises the likes of a recipe by one or lowers them by one. */
  changeLikes(id: string, change: 1 | -1): Promise<void> {
    return updateDoc(doc(this.firestore, RECIPES_COLLECTION, id), { likes: increment(change) });
  }

  /** Loads one recipe by its id, or returns null when no recipe with this id exists. */
  async loadRecipe(id: string): Promise<Recipe | null> {
    const snapshot = await getDoc(doc(this.firestore, RECIPES_COLLECTION, id));
    if (!snapshot.exists()) {
      return null;
    }
    return toRecipe(snapshot.id, snapshot.data());
  }

  /** Loads the recipes with the most likes, for the start page of the cookbook. */
  loadMostLiked(count: number = SHELF_COUNT): Promise<Recipe[]> {
    return this.loadOrdered('likes', count);
  }

  /** Loads the most recently created recipes, for the start page of the cookbook. */
  loadNewest(count: number = SHELF_COUNT): Promise<Recipe[]> {
    return this.loadOrdered('createdAt', count);
  }

  private async loadOrdered(field: 'likes' | 'createdAt', count: number): Promise<Recipe[]> {
    const recipes = collection(this.firestore, RECIPES_COLLECTION);
    const snapshot = await getDocs(query(recipes, orderBy(field, 'desc'), limit(count)));
    return snapshot.docs.map(toRecipeFromDocument);
  }

  /** Loads one page of the recipes of a cuisine. Pass the cursor of the previous page to get the next page. */
  async loadCuisinePage(
    cuisine: RecipeCuisine,
    sort: RecipeSort,
    cursor: RecipePageCursor | null = null,
  ): Promise<RecipePage> {
    const recipes = collection(this.firestore, RECIPES_COLLECTION);
    const snapshot = await getDocs(query(recipes, ...buildPageConstraints(cuisine, sort, cursor)));
    const documents = snapshot.docs;
    return {
      recipes: documents.map(toRecipeFromDocument),
      cursor: documents[documents.length - 1] ?? null,
      hasMore: documents.length === RECIPES_PAGE_SIZE,
    };
  }
}
