import { FILM_RECIPES, findFilmRecipe, isFilmRecipe } from './film-recipes';
import { buildRecipeTags, formatRecipeLabel } from './recipe.model';

describe('formatRecipeLabel', function () {
  it('starts the label with a capital letter', function () {
    expect(formatRecipeLabel('italian')).toBe('Italian');
  });
});

describe('buildRecipeTags', function () {
  it('leaves out the diet when there is none', function () {
    expect(buildRecipeTags({ diet: 'none', timeCategory: 'quick' })).toEqual(['Quick']);
  });

  it('shows the diet before the time category', function () {
    expect(buildRecipeTags({ diet: 'vegan', timeCategory: 'complex' })).toEqual(['Vegan', 'Complex']);
  });
});

describe('film recipes', function () {
  it('has seven recipes with unique ids', function () {
    const ids = FILM_RECIPES.map(function (recipe) {
      return recipe.id;
    });
    expect(ids.length).toBe(7);
    expect(new Set(ids).size).toBe(7);
  });

  it('only uses allowed units and gives every step a cook that exists', function () {
    for (const recipe of FILM_RECIPES) {
      for (const ingredient of recipe.ingredients) {
        expect(['piece', 'ml', 'gram'], recipe.title).toContain(ingredient.unit);
      }
      for (const step of recipe.steps) {
        expect(step.chef, recipe.title).toBeGreaterThanOrEqual(1);
        expect(step.chef, recipe.title).toBeLessThanOrEqual(recipe.cooks);
      }
    }
  });

  it('finds a film recipe by its id and tells it apart from other recipes', function () {
    const recipe = findFilmRecipe('film-brain-on-ice');
    expect(recipe?.title).toBe('Brain on Ice');
    expect(recipe && isFilmRecipe(recipe)).toBe(true);
    expect(findFilmRecipe('someFirestoreId')).toBeUndefined();
  });
});
