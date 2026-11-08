import { cutPage } from './page-cut';

function numbers(count: number): number[] {
  return Array.from({ length: count }, function (_unused, index) {
    return index;
  });
}

describe('cutPage', function () {
  it('shows a short page and has no next page', function () {
    expect(cutPage([1, 2, 3], 12)).toEqual({ shown: [1, 2, 3], hasMore: false });
  });

  it('has no next page when the last page is exactly full', function () {
    const page = cutPage(numbers(12), 12);
    expect(page.shown).toHaveLength(12);
    expect(page.hasMore).toBe(false);
  });

  it('cuts the extra entry and offers a next page', function () {
    const page = cutPage(numbers(13), 12);
    expect(page.shown).toHaveLength(12);
    expect(page.shown[11]).toBe(11);
    expect(page.hasMore).toBe(true);
  });

  it('handles an empty answer', function () {
    expect(cutPage([], 12)).toEqual({ shown: [], hasMore: false });
  });
});
