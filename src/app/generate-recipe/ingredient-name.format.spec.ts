import { capitalizeIngredientName } from './ingredient-name.format';

describe('capitalizeIngredientName', function () {
  it('capitalizes a single word', function () {
    expect(capitalizeIngredientName('nudeln')).toBe('Nudeln');
  });

  it('capitalizes every word', function () {
    expect(capitalizeIngredientName('olive oil')).toBe('Olive Oil');
    expect(capitalizeIngredientName('rote bete')).toBe('Rote Bete');
  });

  it('capitalizes the part after a hyphen', function () {
    expect(capitalizeIngredientName('spaghetti-sauce')).toBe('Spaghetti-Sauce');
  });

  it('keeps the rest of a word as it was typed', function () {
    expect(capitalizeIngredientName('BBQ sauce')).toBe('BBQ Sauce');
    expect(capitalizeIngredientName('Tomaten')).toBe('Tomaten');
  });

  it('does not capitalize after an apostrophe', function () {
    expect(capitalizeIngredientName("baker's yeast")).toBe("Baker's Yeast");
  });

  it('works with umlauts and accents at the start', function () {
    expect(capitalizeIngredientName('äpfel')).toBe('Äpfel');
    expect(capitalizeIngredientName('épices')).toBe('Épices');
  });

  it('removes surrounding and repeated spaces', function () {
    expect(capitalizeIngredientName('  gelbe   zwiebel ')).toBe('Gelbe Zwiebel');
  });

  it('returns an empty text for an empty name', function () {
    expect(capitalizeIngredientName('   ')).toBe('');
  });
});
