export function aRomano(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new RangeError(`numero non valido: ${n}`);
  }

  const migliaia: [number, string][] = [
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

  let resto = n;
  let risultato = "";
  for (const [valore, simbolo] of migliaia) {
    while (resto >= valore) {
      risultato += simbolo;
      resto -= valore;
    }
  }
  return risultato;
}

const VALIDO =
  /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

const VALORI: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

export function daRomano(s: string): number {
  if (typeof s !== "string" || s.length === 0 || !VALIDO.test(s)) {
    throw new RangeError(`numero romano non valido: ${JSON.stringify(s)}`);
  }

  let totale = 0;
  for (let i = 0; i < s.length; i++) {
    const valore = VALORI[s[i]];
    const prossimo = i + 1 < s.length ? VALORI[s[i + 1]] : 0;
    if (valore < prossimo) {
      totale -= valore;
    } else {
      totale += valore;
    }
  }
  return totale;
}
