const SIMBOLI: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export function aRomano(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new RangeError("fuori intervallo");
  let out = "";
  for (const [valore, simbolo] of SIMBOLI) {
    while (n >= valore) {
      out += simbolo;
      n -= valore;
    }
  }
  return out;
}

export function daRomano(s: string): number {
  const valori: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  if (typeof s !== "string" || !/^[IVXLCDM]+$/.test(s)) throw new RangeError("non valido");
  let tot = 0;
  for (let i = 0; i < s.length; i++) {
    const v = valori[s[i]];
    const dopo = valori[s[i + 1]] ?? 0;
    tot += v < dopo ? -v : v;
  }
  if (tot < 1 || tot > 3999 || aRomano(tot) !== s) throw new RangeError("non in forma standard");
  return tot;
}
