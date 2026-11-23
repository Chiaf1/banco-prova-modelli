export function aRomano(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new RangeError("n deve essere un intero tra 1 e 3999");
  }

  const table: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let result = "";
  let rest = n;
  for (const [value, symbol] of table) {
    while (rest >= value) {
      result += symbol;
      rest -= value;
    }
  }
  return result;
}

export function daRomano(s: string): number {
  if (typeof s !== "string" || s.length === 0) {
    throw new RangeError("numero romano non valido");
  }

  const pattern = /^M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/;
  if (!pattern.test(s)) {
    throw new RangeError("numero romano non valido");
  }

  const table: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let result = 0;
  let pos = 0;
  for (const [value, symbol] of table) {
    while (s.startsWith(symbol, pos)) {
      result += value;
      pos += symbol.length;
    }
  }
  return result;
}
