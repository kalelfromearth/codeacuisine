import { buildQrPath, createQrCode } from './qr-code';

function isDiagonal(row: number, column: number): boolean {
  return row === column;
}

function isNeverDark(): boolean {
  return false;
}

describe('buildQrPath', function () {
  it('draws one square for every dark module', function () {
    expect(buildQrPath(2, isDiagonal)).toBe('M0 0h1v1h-1zM1 1h1v1h-1z');
  });

  it('returns an empty path when no module is dark', function () {
    expect(buildQrPath(3, isNeverDark)).toBe('');
  });
});

describe('createQrCode', function () {
  it('creates a square code with a path for a recipe address', async function () {
    const code = await createQrCode('https://codeacuisne.andreas-kissner.cloud/recipes/abc123');
    expect(code.size).toBeGreaterThanOrEqual(21);
    expect(code.path).toMatch(/^M\d+ \d+h1v1h-1z/);
  });
});
