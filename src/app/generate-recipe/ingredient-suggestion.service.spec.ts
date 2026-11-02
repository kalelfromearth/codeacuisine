import { readSuggestions } from './ingredient-suggestion.service';

describe('readSuggestions', function () {
  it('returns the suggestions of a normal answer', function () {
    expect(readSuggestions({ suggestions: ['Pasta', 'Pastry'] })).toEqual(['Pasta', 'Pastry']);
  });

  it('returns an empty list for an answer of the wrong shape', function () {
    expect(readSuggestions(null)).toEqual([]);
    expect(readSuggestions('Pasta')).toEqual([]);
    expect(readSuggestions({ suggestions: 'Pasta' })).toEqual([]);
    expect(readSuggestions({})).toEqual([]);
  });

  it('drops entries that are not short plain texts', function () {
    const answer = { suggestions: ['Pasta', 42, null, '', '   ', 'x'.repeat(41), { name: 'Rice' }] };
    expect(readSuggestions(answer)).toEqual(['Pasta']);
  });

  it('keeps at most six suggestions', function () {
    const answer = { suggestions: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'] };
    expect(readSuggestions(answer)).toHaveLength(6);
  });

  it('does not change text that looks like markup', function () {
    expect(readSuggestions({ suggestions: ['<b>Pasta</b>'] })).toEqual(['<b>Pasta</b>']);
  });
});
