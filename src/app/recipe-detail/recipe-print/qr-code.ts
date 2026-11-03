/** A QR code drawn as one SVG path, every dark module is a square of size 1. */
export interface QrCode {
  size: number;
  path: string;
}

/** Builds the SVG path of a QR code with one square for every dark module. */
export function buildQrPath(size: number, isDark: (row: number, column: number) => boolean): string {
  const squares: string[] = [];
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (isDark(row, column)) {
        squares.push(`M${column} ${row}h1v1h-1z`);
      }
    }
  }
  return squares.join('');
}

/** Creates the QR code for a text. The library is loaded only when somebody prints a recipe. */
export async function createQrCode(text: string): Promise<QrCode> {
  const { default: qrcode } = await import('qrcode-generator');
  const code = qrcode(0, 'M');
  code.addData(text);
  code.make();
  const size = code.getModuleCount();
  return { size, path: buildQrPath(size, code.isDark.bind(code)) };
}
