const VALORI: Array<[number, string]> = [
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

export function aRomano(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new RangeError("n deve essere un intero tra 1 e 3999");
  }
  let resto = n;
  let risultato = "";
  for (const [valore, simbolo] of VALORI) {
    while (resto >= valore) {
      risultato += simbolo;
      resto -= valore;
    }
  }
  return risultato;
}

const DA_VALORE: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

export function daRomano(s: string): number {
  let valore = 0;
  let i = 0;
  while (i < s.length) {
    const due = s.slice(i, i + 2);
    if (VALORI.some(([v, simbolo]) => simbolo === due && (v === 900 || v === 400 || v === 90 || v === 40 || v === 9 || v === 4))) {
      valore += DA_VALORE[due[1]] - DA_VALORE[due[0]];
      i += 2;
    } else {
      const c = s[i];
      if (!(c in DA_VALORE)) {
        throw new RangeError("numero romano non valido");
      }
      valore += DA_VALORE[c];
      i += 1;
    }
  }
  if (valore < 1 || valore > 3999 || aRomano(valore) !== s) {
    throw new RangeError("numero romano non valido");
  }
  return valore;
}
