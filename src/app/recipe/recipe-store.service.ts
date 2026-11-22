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
  setDoc,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FirebaseService } from '../shared/firebase/firebase.service';
import { findFilmRecipe } from './film-recipes';
import { cutPage } from './page-cut';
import { Recipe, RecipeCuisine, RecipeDraft, RecipeIngredient, RecipeStep } from './recipe.model';

const RECIPES_COLLECTION = 'recipes';
const FILM_LIKES_COLLECTION = 'filmLikes';

/** Recipes per page. */
export const RECIPES_PAGE_SIZE = 12;
/** A page asks for one recipe more, which only tells that a next page exists. The Firestore rules allow lists of at most 13, keep both in sync. */
const RECIPES_FETCH_SIZE = RECIPES_PAGE_SIZE + 1;
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

/** Returns a copy of the ingredient with only the fields that are stored. */
function pickIngredient(ingredient: RecipeIngredient): RecipeIngredient {
  return {
    name: ingredient.name,
    amount: ingredient.amount,
    unit: ingredient.unit,
    isExtra: ingredient.isExtra,
  };
}

/** Returns a copy of the step with only the fields that are stored. */
function pickStep(step: RecipeStep): RecipeStep {
  return { title: step.title, text: step.text, chef: step.chef };
}

/** Returns the basic fields of the draft, such as title, time, cuisine and diet, that are stored. */
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

/** Reads a number of hearts from a stored value. Anything unusable counts as 0. */
function readLikeCount(data: Record<string, unknown>): number {
  return Math.max(0, Number(data['likes']) || 0);
}

/** Returns the creation time as an ISO text, or the current time when the stored value is not a timestamp. */
function readCreatedAt(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date().toISOString();
}

/** The result of saving several drafts: the recipes that were saved and the drafts that failed. */
export interface SaveResult {
  saved: Recipe[];
  failed: RecipeDraft[];
}

/** Sorts the drafts into the recipes that were saved and the drafts whose saving failed. */
function splitSaveResults(drafts: RecipeDraft[], results: PromiseSettledResult<Recipe>[]): SaveResult {
  const saved: Recipe[] = [];
  const failed: RecipeDraft[] = [];
  results.forEach(function (result, index) {
    if (result.status === 'fulfilled') {
      saved.push(result.value);
    } else {
      failed.push(drafts[index]);
    }
  });
  return { saved, failed };
}

/** Returns the recipe built from the id and the stored data of a Firestore document. */
function toRecipe(id: string, data: DocumentData): Recipe {
  const fields = pickDocumentFields(data as RecipeDraft);
  return { ...fields, id, likes: data['likes'], createdAt: readCreatedAt(data['createdAt']) };
}

/** Returns the recipe built from a Firestore query result document. */
function toRecipeFromDocument(document: QueryDocumentSnapshot<DocumentData>): Recipe {
  return toRecipe(document.id, document.data());
}

/** Returns the query order: most hearts first for "likes", always with the newest first as tie-breaker. */
function buildSortConstraints(sort: RecipeSort): QueryConstraint[] {
  const newestFirst = orderBy('createdAt', 'desc');
  return sort === 'likes' ? [orderBy('likes', 'desc'), newestFirst] : [newestFirst];
}

/** Returns the query rules for one page of a cuisine: filter, order, start after the cursor and the page size. */
function buildPageConstraints(
  cuisine: RecipeCuisine,
  sort: RecipeSort,
  cursor: RecipePageCursor | null,
): QueryConstraint[] {
  const constraints = [where('cuisine', '==', cuisine), ...buildSortConstraints(sort)];
  if (cursor) {
    constraints.push(startAfter(cursor));
  }
  return [...constraints, limit(RECIPES_FETCH_SIZE)];
}

@Injectable({ providedIn: 'root' })
export class RecipeStoreService {
  private readonly firestore = inject(FirebaseService).firestore;

  /** Saves all drafts as new recipes. A draft that fails does not stop the others. */
  async saveRecipes(drafts: RecipeDraft[]): Promise<SaveResult> {
    const results = await Promise.allSettled(drafts.map(this.saveRecipe.bind(this)));
    return splitSaveResults(drafts, results);
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

  /** Raises the likes of a recipe by one or lowers them by one. A film recipe keeps its hearts in its own collection. */
  changeLikes(id: string, change: 1 | -1): Promise<void> {
    if (findFilmRecipe(id)) {
      return setDoc(doc(this.firestore, FILM_LIKES_COLLECTION, id), { likes: increment(change) }, { merge: true });
    }
    return updateDoc(doc(this.firestore, RECIPES_COLLECTION, id), { likes: increment(change) });
  }

  /** Loads the hearts of all film recipes by their ids. A film recipe nobody liked yet is missing in the result. */
  async loadFilmLikes(): Promise<Record<string, number>> {
    const snapshot = await getDocs(query(collection(this.firestore, FILM_LIKES_COLLECTION), limit(RECIPES_PAGE_SIZE)));
    const likes: Record<string, number> = {};
    snapshot.docs.forEach(function (document) {
      likes[document.id] = readLikeCount(document.data());
    });
    return likes;
  }

  /** Loads the hearts of one film recipe, 0 when nobody liked it yet. */
  async loadFilmLikeCount(id: string): Promise<number> {
    const snapshot = await getDoc(doc(this.firestore, FILM_LIKES_COLLECTION, id));
    return snapshot.exists() ? readLikeCount(snapshot.data()) : 0;
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

  /** Loads the given number of recipes, ordered by the field with the highest value first. */
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
    const page = cutPage(snapshot.docs, RECIPES_PAGE_SIZE);
    return {
      recipes: page.shown.map(toRecipeFromDocument),
      cursor: page.shown[page.shown.length - 1] ?? null,
      hasMore: page.hasMore,
    };
  }
}
