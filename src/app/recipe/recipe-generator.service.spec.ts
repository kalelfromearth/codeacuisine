import { TestBed } from '@angular/core/testing';
import { RecipeGeneratorService } from './recipe-generator.service';
import { RecipeRequestService } from './recipe-request.service';
import { RecipeStoreService, SaveResult } from './recipe-store.service';
import { Recipe, RecipeDraft } from './recipe.model';

function buildDraft(title: string): RecipeDraft {
  return {
    title,
    cookingMinutes: 20,
    timeCategory: 'quick',
    cuisine: 'italian',
    diet: 'vegetarian',
    servings: 2,
    cooks: 1,
    nutrition: { calories: 500, protein: 20, fat: 20, carbs: 60 },
    ingredients: [
      { name: 'Pasta', amount: 100, unit: 'gram', isExtra: false },
      { name: 'Tomato', amount: 200, unit: 'gram', isExtra: false },
    ],
    steps: [
      { title: 'Cook', text: 'Cook the pasta.', chef: 1 },
      { title: 'Serve', text: 'Serve it warm.', chef: 1 },
    ],
  };
}

function toRecipe(draft: RecipeDraft): Recipe {
  return { ...draft, id: `id-${draft.title}`, likes: 0, createdAt: '2026-10-31T00:00:00.000Z' };
}

describe('RecipeGeneratorService', function () {
  const drafts = [buildDraft('One'), buildDraft('Two'), buildDraft('Three')];
  let savedBatches: RecipeDraft[][];
  let saveResults: SaveResult[];

  beforeEach(function () {
    savedBatches = [];
    saveResults = [];
    sessionStorage.clear();
    const fakeStore = {
      saveRecipes(batch: RecipeDraft[]): Promise<SaveResult> {
        savedBatches.push(batch);
        return Promise.resolve(saveResults.shift() as SaveResult);
      },
    };
    vi.stubGlobal('fetch', function () {
      return Promise.resolve(new Response(JSON.stringify({ status: 'ok', recipes: drafts }), { status: 200 }));
    });
    TestBed.configureTestingModule({ providers: [{ provide: RecipeStoreService, useValue: fakeStore }] });
    TestBed.inject(RecipeRequestService).setRequest({
      ingredients: [{ name: 'Pasta', amount: 100, unit: 'gram' }],
      servings: 2,
      cooks: 1,
      timeCategory: 'quick',
      cuisine: 'italian',
      diet: 'vegetarian',
    });
  });

  afterEach(function () {
    vi.unstubAllGlobals();
  });

  it('saves only the recipes that failed again when the user tries again', async function () {
    saveResults.push({ saved: [toRecipe(drafts[0]), toRecipe(drafts[1])], failed: [drafts[2]] });
    saveResults.push({ saved: [toRecipe(drafts[2])], failed: [] });
    const generator = TestBed.inject(RecipeGeneratorService);

    await generator.generate();
    expect(generator.status()).toBe('error');

    await generator.retry();
    expect(savedBatches[1]).toEqual([drafts[2]]);
    expect(generator.status()).toBe('success');
    expect(generator.recipes().length).toBe(3);
  });

  it('shows the recipes at once when all of them are saved', async function () {
    saveResults.push({ saved: drafts.map(toRecipe), failed: [] });
    const generator = TestBed.inject(RecipeGeneratorService);

    await generator.generate();
    expect(generator.status()).toBe('success');
    expect(generator.recipes().length).toBe(3);
    expect(savedBatches.length).toBe(1);
  });
});
