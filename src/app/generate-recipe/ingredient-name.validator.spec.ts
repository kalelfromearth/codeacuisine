import { FormControl } from '@angular/forms';
import { looksLikeIngredientName, plausibleIngredientName } from './ingredient-name.validator';

describe('looksLikeIngredientName', function () {
  it('accepts normal food names in English and German', function () {
    for (const name of ['Pasta', 'Egg', 'Ei', 'Tomato', 'Baby spinach', 'Kartoffel', 'Schnitzel', 'Crème fraîche']) {
      expect(looksLikeIngredientName(name), name).toBe(true);
    }
  });

  it('rejects keyboard mashing, repeated letters and text without letters', function () {
    for (const name of ['asdfgh', 'qwertz', 'xxxxx', 'brrrr', '123', 'x']) {
      expect(looksLikeIngredientName(name), name).toBe(false);
    }
  });
});

describe('plausibleIngredientName', function () {
  it('leaves an empty field to the required validator', function () {
    expect(plausibleIngredientName(new FormControl(''))).toBeNull();
  });

  it('reports an implausible name', function () {
    expect(plausibleIngredientName(new FormControl('sdfsdf'))).toEqual({ implausibleName: true });
  });

  it('accepts a plausible name', function () {
    expect(plausibleIngredientName(new FormControl('Tomato'))).toBeNull();
  });
});
